import { Injectable } from '@nestjs/common';
import { Activity } from './entities/activity.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityWeatherRule } from './entities/activity-weather-rule.entity';

@Injectable()
export class ActivityService {
    constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ActivityWeatherRule)
    private readonly activityWeatherRuleRepository: Repository<ActivityWeatherRule>,
    ) {}
}
