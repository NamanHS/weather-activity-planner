import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Activity } from './entities/activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityWeatherRule } from './entities/activity-weather-rule.entity';

@Module({
  providers: [ActivityService],
  imports: [TypeOrmModule.forFeature([Activity, ActivityWeatherRule])],
  exports: [ActivityService]
})
export class ActivityModule {}
