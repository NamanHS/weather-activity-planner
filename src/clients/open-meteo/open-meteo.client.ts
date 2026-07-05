import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Configuration } from 'src/config/configuration.schema';
import { OpenMeteoRequestDto } from './dto/open-meteo-request.dto';
import { OpenMeteoResponseDto } from './dto/open-meteo-response.dto';
import {
  CityWeatherForecast,
  WeatherForecastEntry,
} from './dto/city-weather-forecast.dto';
import { WEATHER_CODE_MAPPING } from './weather-condition.mapper';

@Injectable()
export class OpenMeteoClient {
  private readonly logger = new Logger(OpenMeteoClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getWeatherForecast(
    request: OpenMeteoRequestDto,
  ): Promise<CityWeatherForecast> {
    const {
      baseUrl,
      forecastDays,
      timeoutMs,
      retryCount,
      retryDelayMs,
    } = this.configService.getOrThrow<Configuration['clients']['openMeteo']>(
      'clients.openMeteo',
    );

    const params = {
      latitude: request.latitude,
      longitude: request.longitude,
      timezone: request.timezone,
      forecast_days: forecastDays,
      daily: [
        'temperature_2m_min',
        'temperature_2m_max',
        'precipitation_probability_max',
        'weather_code',
        'wind_speed_10m_max',
      ].join(','),
    };

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        this.logger.debug(
          `Fetching weather forecast (${attempt}/${retryCount}) for city ${request.cityName}`,
        );

        const response = await firstValueFrom(
          this.httpService.get<OpenMeteoResponseDto>(
            `${baseUrl}/forecast`,
            {
              timeout: timeoutMs,
              params,
            },
          ),
        );

        this.logger.debug(
          `Successfully fetched weather forecast for city ${request.cityName}`,
        );

        return {
          forecasts: this.mapForecast(response.data),
        };
      } catch (error) {
        this.logger.warn(
          `Attempt ${attempt}/${retryCount} failed while fetching weather forecast`,
        );

        if (attempt === retryCount) {
          this.logger.error(
            `Failed to fetch weather forecast from Open-Meteo for city ${request.cityName}`,
            error instanceof Error ? error.stack : undefined,
          );

          throw new ServiceUnavailableException(
            'Failed to fetch weather forecast from Open-Meteo',
          );
        }

        await this.sleep(retryDelayMs);
      }
    }

    // Defensive fallback. This line should never be reached.
    throw new ServiceUnavailableException(
      'Failed to fetch weather forecast from Open-Meteo',
    );
  }

  private mapForecast(
    response: OpenMeteoResponseDto,
  ): WeatherForecastEntry[] {
    return response.daily.time.map((date, index) => ({
      date,
      temperatureMin: response.daily.temperature_2m_min[index],
      temperatureMax: response.daily.temperature_2m_max[index],
      temperatureMean: response.daily.temperature_2m_min[index],
      precipitationProbability:
        response.daily.precipitation_probability_max[index],
      condition: WEATHER_CODE_MAPPING[response.daily.weather_code[index]],
      windSpeed: response.daily.wind_speed_10m_max[index],
    }));
  }

  private async sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}