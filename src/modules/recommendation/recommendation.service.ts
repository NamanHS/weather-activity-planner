import { Injectable, Logger } from '@nestjs/common';

import { Activity } from '../activity/entities/activity.entity';
import { ActivityService } from '../activity/activity.service';
import { CityService } from '../city/city.service';

import { WeatherForecastEntry } from 'src/clients/open-meteo/dto/city-weather-forecast.dto';

import { ActivityRecommendationRuleEngine } from './activity-recommendation-rule-engine.service';

import { RecommendationRequest } from './dto/recommendation-request.dto';
import { RecommendationResponse } from './dto/recommendation-response.dto';
import { DailyRecommendation } from './dto/daily-recommendation.dto';
import { DailyWeather } from './dto/daily-weather.dto';
import { ActivityRecommendation } from './dto/activity-recommendation.dto';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly cityService: CityService,
    private readonly activityService: ActivityService,
    private readonly ruleEngine: ActivityRecommendationRuleEngine,
  ) {}

  async getRecommendations(
    request: RecommendationRequest,
  ): Promise<RecommendationResponse> {
    this.logger.log(
      `Generating recommendations for ${request.cityName}, ${request.countryCode}`,
    );

    const { forecast, lastRefreshedAt } =
      await this.cityService.getForecast(request);

    const activities =
      await this.activityService.getActivitiesWithRules();

    const dailyRecommendations = forecast.forecasts.map((weather) =>
      this.createDailyRecommendation(weather, activities),
    );

    this.logger.log(
      `Successfully generated recommendations for ${request.cityName}, ${request.countryCode}`,
    );

    return {
      lastRefreshedAt,
      dailyRecommendations,
    };
  }

  private createDailyRecommendation(
    weather: WeatherForecastEntry,
    activities: Activity[],
  ): DailyRecommendation {
    return {
      date: weather.date,
      weather: this.mapWeather(weather),
      activities: this.getRecommendedActivities(
        weather,
        activities,
      ),
    };
  }

  private getRecommendedActivities(
    weather: WeatherForecastEntry,
    activities: Activity[],
  ): ActivityRecommendation[] {
    return activities
      .map((activity) => ({
        activityName: activity.name,
        activityDescription: activity.description,
        score: this.ruleEngine.calculateScore(
          activity,
          weather,
        ),
      }))
      .sort((left, right) => right.score - left.score);
  }

  private mapWeather(
    weather: WeatherForecastEntry,
  ): DailyWeather {
    return {
      temperatureMin: weather.temperatureMin,
      temperatureMax: weather.temperatureMax,
      temperatureMean: weather.temperatureMean,
      precipitationProbability:
        weather.precipitationProbability,
      condition: weather.condition,
      windSpeed: weather.windSpeed,
    };
  }
}