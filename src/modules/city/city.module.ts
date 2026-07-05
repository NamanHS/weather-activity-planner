import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { OpenMeteoModule } from 'src/clients/open-meteo/open-meteo.module';

@Module({
  providers: [CityService],
  imports: [TypeOrmModule.forFeature([City]), OpenMeteoModule],
  exports: [CityService],
})
export class CityModule {}
