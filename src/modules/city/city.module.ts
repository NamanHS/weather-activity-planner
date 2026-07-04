import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';

@Module({
  providers: [CityService],
  imports: [TypeOrmModule.forFeature([City])]
})
export class CityModule {}
