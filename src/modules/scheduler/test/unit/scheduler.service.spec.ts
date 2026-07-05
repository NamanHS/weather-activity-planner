import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { SchedulerService } from '../../scheduler.service';
import { CityService } from 'src/modules/city/city.service';

describe('SchedulerService', () => {
  let service: SchedulerService;

  const cityService = {
    refreshWeatherForEligibleCities: jest.fn(),
  };

  const configService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: CityService,
          useValue: cityService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get(SchedulerService);
  });

  it('should refresh city weather when scheduler is enabled', async () => {
    configService.getOrThrow.mockReturnValue({
      enabled: true,
    });

    await service.refreshCityWeather();

    expect(configService.getOrThrow).toHaveBeenCalledWith(
      'scheduler.cityWeatherRefresh',
    );

    expect(cityService.refreshWeatherForEligibleCities).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should not refresh city weather when scheduler is disabled', async () => {
    configService.getOrThrow.mockReturnValue({
      enabled: false,
    });

    await service.refreshCityWeather();

    expect(cityService.refreshWeatherForEligibleCities).not.toHaveBeenCalled();
  });

  it('should propagate errors from CityService', async () => {
    configService.getOrThrow.mockReturnValue({
      enabled: true,
    });

    cityService.refreshWeatherForEligibleCities.mockRejectedValue(
      new Error('Refresh failed'),
    );

    await expect(service.refreshCityWeather()).rejects.toThrow(
      'Refresh failed',
    );

    expect(cityService.refreshWeatherForEligibleCities).toHaveBeenCalledTimes(
      1,
    );
  });
});
