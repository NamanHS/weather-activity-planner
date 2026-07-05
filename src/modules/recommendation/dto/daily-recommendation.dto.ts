import { ActivityRecommendation } from './activity-recommendation.dto';
import { DailyWeather } from './daily-weather.dto';

export interface DailyRecommendation {
  date: string;
  weather: DailyWeather;
  activities: ActivityRecommendation[];
}
