import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ActivityService } from '../../activity.service';
import { Activity } from '../../entities/activity.entity';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRepository: jest.Mocked<Repository<Activity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ActivityService);
    activityRepository = module.get(getRepositoryToken(Activity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all activities with weather rules', async () => {
    const activities = [
      {
        id: 1,
        name: 'Surfing',
      },
      {
        id: 2,
        name: 'Indoor Sightseeing',
      },
    ] as Activity[];

    activityRepository.find.mockResolvedValue(activities);

    const result = await service.getActivitiesWithRules();

    expect(result).toEqual(activities);

    expect(activityRepository.find).toHaveBeenCalledWith({
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
  });
});
