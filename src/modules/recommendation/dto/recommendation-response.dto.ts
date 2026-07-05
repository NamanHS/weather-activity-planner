import { DailyRecommendation } from './daily-recommendation.dto';

export interface RecommendationResponse {
  lastRefreshedAt: Date | null;
  dailyRecommendations: DailyRecommendation[];
}
