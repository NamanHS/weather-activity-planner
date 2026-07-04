import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CityForecastRequest } from './dto/city-forcast-request.dto';
import { CityForecastResponse } from './dto/city-forcast-response.dto';
import { OpenMeteoClient } from 'src/clients/open-meteo/open-meteo.client';
import { Configuration } from 'src/config/configuration.schema';


@Injectable()
export class CityService {
  private readonly logger = new Logger(CityService.name);

  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly openMeteoClient: OpenMeteoClient,
    private readonly configService: ConfigService,
  ) {}

  async getForecast(
    request: CityForecastRequest,
  ): Promise<CityForecastResponse> {
    const city = await this.findCity(
      request.cityName,
      request.countryCode,
    );

    this.logger.debug(
      `Weather requested for ${city.name}, ${city.countryCode}`,
    );

    city.lastRequestedAt = new Date();

    if (this.isRefreshRequired(city)) {
      await this.refreshWeather(city);
    }

    // Persist the latest request timestamp and refreshed weather (if refreshed).
    await this.cityRepository.save(city);

    return {
      forecast: city.weatherData!,
      lastRefreshedAt: city.lastRefreshedAt!,
    };
  }

  /**
   * Invoked by the scheduler.
   * Refreshes weather for cities that were recently requested
   * and whose cached weather has expired.
   */
  async refreshWeatherForEligibleCities(): Promise<void> {
    const cityWeatherRefreshConfig = this.configService.getOrThrow<Configuration['scheduler']['cityWeatherRefresh']>('scheduler.cityWeatherRefresh');
    const { batchSize, activeCityWindowDays } = cityWeatherRefreshConfig;

    const cities = await this.findCitiesRequiringRefresh(
      activeCityWindowDays,
    );

    this.logger.log(
      `Refreshing weather for ${cities.length} eligible cities.`,
    );

    for (
      let index = 0;
      index < cities.length;
      index += batchSize
    ) {
      const batch = cities.slice(
        index,
        index + batchSize,
      );

      await Promise.all(
        batch.map(async (city) => {
          try {
            await this.refreshWeather(city);
            await this.cityRepository.save(city);
          } catch (error) {
            this.logger.error(
              `Failed to refresh weather for ${city.name}, ${city.countryCode}`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }),
      );
    }

    this.logger.log(
      `Successfully completed weather refresh for eligible cities.`,
    );
  }

  private async findCity(
    cityName: string,
    countryCode: string,
  ): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: {
        name: cityName.trim().toLowerCase(),
        countryCode: countryCode.trim().toUpperCase(),
      },
    });

    if (!city) {
      throw new NotFoundException(
        "We don't support this city in the specified country yet. Please contact our support team if you'd like to request support for this location.",
      );
    }

    return city;
  }

  /**
   * Returns cities that:
   * 1. Were requested within the configured active window.
   * 2. Have stale weather data.
   */
  private async findCitiesRequiringRefresh(
    activeCityWindowDays: number,
  ): Promise<City[]> {
    return this.cityRepository
      .createQueryBuilder('city')
      .where(
        `
          city.last_requested_at IS NOT NULL
          AND city.last_requested_at >=
              CURRENT_TIMESTAMP - (:activeCityWindowDays * INTERVAL '1 day')
        `,
        { activeCityWindowDays },
      )
      .andWhere(
        `
          city.last_refreshed_at IS NULL
          OR (
            city.last_refreshed_at +
            (city.refresh_interval_minutes * INTERVAL '1 minute')
          ) <= CURRENT_TIMESTAMP
        `,
      )
      .orderBy('city.last_requested_at', 'DESC')
      .getMany();
  }

  private async refreshWeather(city: City): Promise<void> {
    this.logger.debug(
      `Refreshing weather for ${city.name}, ${city.countryCode}`,
    );

    city.weatherData = await this.openMeteoClient.getWeatherForecast({
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      cityName: city.name
    });

    city.lastRefreshedAt = new Date();
  }

  private isRefreshRequired(city: City): boolean {
    if (!city.lastRefreshedAt) {
      return true;
    }

    const nextRefreshTime =
      city.lastRefreshedAt.getTime() +
      city.refreshIntervalMinutes * 60_000;

    return Date.now() >= nextRefreshTime;
  }
}