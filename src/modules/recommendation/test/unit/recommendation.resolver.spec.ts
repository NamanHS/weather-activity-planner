import { Test, TestingModule } from '@nestjs/testing';

import { RecommendationResolver } from '../../recommendation.resolver';
import { RecommendationService } from '../../recommendation.service';

describe('RecommendationResolver', () => {
  let resolver: RecommendationResolver;

  const recommendationService = {
    getRecommendations: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationResolver,
        {
          provide: RecommendationService,
          useValue: recommendationService,
        },
      ],
    }).compile();

    resolver = module.get<RecommendationResolver>(RecommendationResolver);
  });

  describe('activityRecommendations', () => {
    it('should return recommendations from RecommendationService', async () => {
      const input = {
        cityName: 'mumbai',
        countryCode: 'IN',
      };

      const response = {
        lastRefreshedAt: new Date('2026-07-05T10:00:00Z'),
        dailyRecommendations: [
          {
            date: '2026-07-05',
            weather: {
              temperatureMin: 25,
              temperatureMax: 30,
              temperatureMean: 27.5,
              precipitationProbability: 20,
              condition: 'CLEAR',
              windSpeed: 12,
            },
            activities: [
              {
                activityName: 'Outdoor Sightseeing',
                activityDescription: 'Explore landmarks',
                score: 100,
              },
            ],
          },
        ],
      };

      recommendationService.getRecommendations.mockResolvedValue(response);

      const result = await resolver.activityRecommendations(input);

      expect(recommendationService.getRecommendations).toHaveBeenCalledTimes(1);

      expect(recommendationService.getRecommendations).toHaveBeenCalledWith(
        input,
      );

      expect(result).toEqual(response);
    });

    it('should propagate errors from RecommendationService', async () => {
      const input = {
        cityName: 'mumbai',
        countryCode: 'IN',
      };

      recommendationService.getRecommendations.mockRejectedValue(
        new Error('Something went wrong'),
      );

      await expect(resolver.activityRecommendations(input)).rejects.toThrow(
        'Something went wrong',
      );

      expect(recommendationService.getRecommendations).toHaveBeenCalledWith(
        input,
      );
    });
  });
});
