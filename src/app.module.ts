import { Module } from '@nestjs/common';
import { CityModule } from './modules/city/city.module';
import { ActivityModule } from './modules/activity/activity.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [CityModule, ActivityModule, RecommendationModule, SchedulerModule, ConfigModule],
})
export class AppModule {}
