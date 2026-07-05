import { Injectable } from '@nestjs/common';

import { Activity } from 'src/modules/activity/entities/activity.entity';
import { ActivityWeatherRule } from 'src/modules/activity/entities/activity-weather-rule.entity';
import { WeatherForecastEntry } from 'src/clients/open-meteo/dto/city-weather-forecast.dto';
import { ComparisonType } from 'src/common/enums/comparison-type.enum';
import { WeatherFactor } from 'src/common/enums/weather-factor.enum';

@Injectable()
export class ActivityRecommendationRuleEngine {
  calculateScore(activity: Activity, weather: WeatherForecastEntry): number {
    let score = 0;

    for (const rule of activity.weatherRules) {
      if (this.isRuleSatisfied(rule, weather)) {
        score += rule.score;
      } else {
        score -= rule.penalty;
      }
    }

    return Math.max(score, 0);
  }

  private isRuleSatisfied(
    rule: ActivityWeatherRule,
    weather: WeatherForecastEntry,
  ): boolean {
    const weatherValue = this.getWeatherValue(weather, rule.weatherFactor);

    switch (rule.comparisonType) {
      case ComparisonType.MIN:
        return weatherValue >= rule.valueFrom!;

      case ComparisonType.MAX:
        return weatherValue <= rule.valueFrom!;

      case ComparisonType.RANGE:
        return weatherValue >= rule.valueFrom! && weatherValue <= rule.valueTo!;

      case ComparisonType.IN:
        return rule.comparisonValues?.includes(weatherValue) ?? false;

      default:
        return false;
    }
  }

  /**
   * Maps a weather factor to the corresponding value
   * from the daily weather forecast.
   */
  private getWeatherValue(
    weather: WeatherForecastEntry,
    weatherFactor: WeatherFactor,
  ): any {
    switch (weatherFactor) {
      case WeatherFactor.TEMPERATURE:
        return weather.temperatureMean;

      case WeatherFactor.WIND_SPEED:
        return weather.windSpeed;

      case WeatherFactor.PRECIPITATION_PROBABILITY:
        return weather.precipitationProbability;

      case WeatherFactor.CONDITION:
        return weather.condition;
    }
  }
}
