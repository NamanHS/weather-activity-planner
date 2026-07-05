import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

import { CityService } from '../../city.service';
import { City } from '../../entities/city.entity';

import { OpenMeteoClient } from '../../../../clients/open-meteo/open-meteo.client';

describe('CityService', () => {
  let service: CityService;

  const repository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const openMeteoClient = {
    getWeatherForecast: jest.fn(),
  };

  const configService = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: getRepositoryToken(City),
          useValue: repository,
        },
        {
          provide: OpenMeteoClient,
          useValue: openMeteoClient,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get(CityService);
  });

  describe('getForecast', () => {
    it('should return cached weather when refresh is not required', async () => {
      const city = {
        id: 1,
        name: 'mumbai',
        countryCode: 'IN',
        refreshIntervalMinutes: 120,
        lastRefreshedAt: new Date(),
        weatherData: {
          forecasts: [],
        },
      } as unknown as City;

      repository.findOne.mockResolvedValue(city);
      repository.save.mockResolvedValue(city);

      const result = await service.getForecast({
        cityName: 'mumbai',
        countryCode: 'IN',
      });

      expect(openMeteoClient.getWeatherForecast).not.toHaveBeenCalled();

      expect(repository.save).toHaveBeenCalled();

      expect(result.forecast).toEqual(city.weatherData);
    });

    it('should refresh weather when cache has expired', async () => {
      const city = {
        id: 1,
        name: 'mumbai',
        countryCode: 'IN',
        latitude: 19,
        longitude: 72,
        timezone: 'Asia/Kolkata',
        refreshIntervalMinutes: 60,
        lastRefreshedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      } as City;

      repository.findOne.mockResolvedValue(city);

      openMeteoClient.getWeatherForecast.mockResolvedValue({
        forecasts: [{ date: '2026-07-05' }],
      });

      repository.save.mockResolvedValue(city);

      await service.getForecast({
        cityName: 'mumbai',
        countryCode: 'IN',
      });

      expect(openMeteoClient.getWeatherForecast).toHaveBeenCalledTimes(1);

      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when city does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.getForecast({
          cityName: 'unknown',
          countryCode: 'IN',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('refreshWeatherForEligibleCities', () => {
    it('should refresh every eligible city', async () => {
      configService.getOrThrow.mockReturnValue({
        batchSize: 2,
        activeCityWindowDays: 30,
      });

      const city1 = {
        name: 'mumbai',
        countryCode: 'IN',
        latitude: 19,
        longitude: 72,
        timezone: 'Asia/Kolkata',
      };

      const city2 = {
        name: 'london',
        countryCode: 'GB',
        latitude: 51,
        longitude: 0,
        timezone: 'Europe/London',
      };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([city1, city2]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder);

      openMeteoClient.getWeatherForecast.mockResolvedValue({
        forecasts: [],
      });

      repository.save.mockResolvedValue(undefined);

      await service.refreshWeatherForEligibleCities();

      expect(openMeteoClient.getWeatherForecast).toHaveBeenCalledTimes(2);

      expect(repository.save).toHaveBeenCalledTimes(2);
    });

    it('should continue refreshing remaining cities when one refresh fails', async () => {
      configService.getOrThrow.mockReturnValue({
        batchSize: 5,
        activeCityWindowDays: 30,
      });

      const city1 = {
        name: 'mumbai',
        countryCode: 'IN',
        latitude: 19,
        longitude: 72,
        timezone: 'Asia/Kolkata',
      };

      const city2 = {
        name: 'london',
        countryCode: 'GB',
        latitude: 51,
        longitude: 0,
        timezone: 'Europe/London',
      };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([city1, city2]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder);

      openMeteoClient.getWeatherForecast
        .mockRejectedValueOnce(new Error('OpenMeteo failed'))
        .mockResolvedValueOnce({
          forecasts: [],
        });

      repository.save.mockResolvedValue(undefined);

      await service.refreshWeatherForEligibleCities();

      expect(openMeteoClient.getWeatherForecast).toHaveBeenCalledTimes(2);

      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when no eligible cities exist', async () => {
      configService.getOrThrow.mockReturnValue({
        batchSize: 2,
        activeCityWindowDays: 30,
      });

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      repository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.refreshWeatherForEligibleCities();

      expect(openMeteoClient.getWeatherForecast).not.toHaveBeenCalled();

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
