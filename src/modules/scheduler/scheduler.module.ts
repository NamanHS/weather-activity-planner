import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CityModule } from '../city/city.module';

@Module({
  imports: [CityModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
