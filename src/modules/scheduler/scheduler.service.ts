import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CityService } from '../city/city.service';
import { Configuration } from 'src/config/configuration.schema';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly cityService: CityService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Runs every 30 minutes.
   *
   */
  @Cron('0 */30 * * * *')
  async refreshCityWeather(): Promise<void> {
    const { enabled } = this.configService.getOrThrow<
      Configuration['scheduler']['cityWeatherRefresh']
    >('scheduler.cityWeatherRefresh');

    if (!enabled) {
      this.logger.debug('City weather refresh scheduler is disabled.');
      return;
    }

    this.logger.log('Starting city weather refresh.');

    await this.cityService.refreshWeatherForEligibleCities();

    this.logger.log('City weather refresh completed.');
  }
}
