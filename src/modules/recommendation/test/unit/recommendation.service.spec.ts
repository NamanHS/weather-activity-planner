import { Test, TestingModule } from '@nestjs/testing';

import { RecommendationService } from '../../recommendation.service';
import { ActivityRecommendationRuleEngine } from '../../activity-recommendation-rule-engine.service';

import { CityService } from 'src/modules/city/city.service';
import { ActivityService } from 'src/modules/activity/activity.service';

describe('RecommendationService', () => {
  let service: RecommendationService;

  const mockCityService = {
    getForecast: jest.fn(),
  };

  const mockActivityService = {
    getActivitiesWithRules: jest.fn(),
  };

  const mockRuleEngine = {
    calculateScore: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: CityService,
          useValue: mockCityService,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
        {
          provide: ActivityRecommendationRuleEngine,
          useValue: mockRuleEngine,
        },
      ],
    }).compile();

    service = module.get(RecommendationService);
  });

  it('should generate activity recommendations', async () => {
    mockCityService.getForecast.mockResolvedValue({
      lastRefreshedAt: new Date('2026-07-05T10:00:00Z'),
      forecast: {
        forecasts: [
          {
            date: '2026-07-05',
            temperatureMin: 20,
            temperatureMax: 30,
            temperatureMean: 25,
            precipitationProbability: 10,
            condition: 'CLEAR',
            windSpeed: 12,
          },
        ],
      },
    });

    mockActivityService.getActivitiesWithRules.mockResolvedValue([
      {
        name: 'Surfing',
        description: 'Surf',
        weatherRules: [],
      },
      {
        name: 'Sightseeing',
        description: 'Walk',
        weatherRules: [],
      },
    ]);

    mockRuleEngine.calculateScore
      .mockReturnValueOnce(80)
      .mockReturnValueOnce(40);

    const result = await service.getRecommendations({
      cityName: 'mumbai',
      countryCode: 'IN',
    });

    expect(mockCityService.getForecast).toHaveBeenCalledWith({
      cityName: 'mumbai',
      countryCode: 'IN',
    });

    expect(mockActivityService.getActivitiesWithRules).toHaveBeenCalled();

    expect(mockRuleEngine.calculateScore).toHaveBeenCalledTimes(2);

    expect(result.lastRefreshedAt).toEqual(new Date('2026-07-05T10:00:00Z'));

    expect(result.dailyRecommendations).toHaveLength(1);

    expect(result.dailyRecommendations[0]).toEqual({
      date: '2026-07-05',
      weather: {
        temperatureMin: 20,
        temperatureMax: 30,
        temperatureMean: 25,
        precipitationProbability: 10,
        condition: 'CLEAR',
        windSpeed: 12,
      },
      activities: [
        {
          activityName: 'Surfing',
          activityDescription: 'Surf',
          score: 80,
        },
        {
          activityName: 'Sightseeing',
          activityDescription: 'Walk',
          score: 40,
        },
      ],
    });
  });

  it('should sort activities by descending score', async () => {
    mockCityService.getForecast.mockResolvedValue({
      lastRefreshedAt: new Date(),
      forecast: {
        forecasts: [
          {
            date: '2026-07-05',
            temperatureMin: 20,
            temperatureMax: 30,
            temperatureMean: 25,
            precipitationProbability: 10,
            condition: 'CLEAR',
            windSpeed: 12,
          },
        ],
      },
    });

    mockActivityService.getActivitiesWithRules.mockResolvedValue([
      {
        name: 'A',
        description: 'A',
        weatherRules: [],
      },
      {
        name: 'B',
        description: 'B',
        weatherRules: [],
      },
    ]);

    mockRuleEngine.calculateScore
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(90);

    const result = await service.getRecommendations({
      cityName: 'mumbai',
      countryCode: 'IN',
    });

    expect(result.dailyRecommendations[0].activities).toEqual([
      {
        activityName: 'B',
        activityDescription: 'B',
        score: 90,
      },
      {
        activityName: 'A',
        activityDescription: 'A',
        score: 10,
      },
    ]);
  });

  it('should generate recommendations for multiple forecast days', async () => {
    mockCityService.getForecast.mockResolvedValue({
      lastRefreshedAt: new Date(),
      forecast: {
        forecasts: [
          {
            date: '2026-07-05',
            temperatureMin: 20,
            temperatureMax: 30,
            temperatureMean: 25,
            precipitationProbability: 10,
            condition: 'CLEAR',
            windSpeed: 12,
          },
          {
            date: '2026-07-06',
            temperatureMin: 18,
            temperatureMax: 28,
            temperatureMean: 23,
            precipitationProbability: 20,
            condition: 'RAIN',
            windSpeed: 15,
          },
        ],
      },
    });

    mockActivityService.getActivitiesWithRules.mockResolvedValue([
      {
        name: 'Surfing',
        description: 'Surf',
        weatherRules: [],
      },
    ]);

    mockRuleEngine.calculateScore.mockReturnValue(50);

    const result = await service.getRecommendations({
      cityName: 'mumbai',
      countryCode: 'IN',
    });

    expect(result.dailyRecommendations).toHaveLength(2);

    expect(mockRuleEngine.calculateScore).toHaveBeenCalledTimes(2);
  });

  it('should propagate exception from CityService', async () => {
    mockCityService.getForecast.mockRejectedValue(new Error('City not found'));

    await expect(
      service.getRecommendations({
        cityName: 'abc',
        countryCode: 'IN',
      }),
    ).rejects.toThrow('City not found');

    expect(mockActivityService.getActivitiesWithRules).not.toHaveBeenCalled();
  });
});
