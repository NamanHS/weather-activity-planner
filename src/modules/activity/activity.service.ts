import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async getActivitiesWithRules(): Promise<Activity[]> {
    return this.activityRepository.find({
      relations: {
        weatherRules: true,
      },
      order: {
        id: 'ASC',
        weatherRules: {
          id: 'ASC',
        },
      },
    });
  }
}