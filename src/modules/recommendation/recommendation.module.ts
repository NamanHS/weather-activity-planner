import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationResolver } from './recommendation.resolver';
import { ActivityModule } from '../activity/activity.module';
import { CityModule } from '../city/city.module';
import { ActivityRecommendationRuleEngine } from './activity-recommendation-rule-engine.service';

@Module({
  imports: [CityModule, ActivityModule],
  providers: [RecommendationService, ActivityRecommendationRuleEngine, RecommendationResolver]
})
export class RecommendationModule {}
