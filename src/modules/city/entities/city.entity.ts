import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/common/database/base.entity";
import type { CityWeatherForecast } from "src/clients/open-meteo/dto/city-weather-forecast.dto";

@Entity('cities')
export class City extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 2,
  })
  countryCode!: string;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
  })
  latitude!: number;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
  })
  longitude!: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  timezone!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  weatherData?: CityWeatherForecast;

  @Column({
    type: 'integer',
  })
  refreshIntervalMinutes!: number;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  lastRefreshedAt?: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  lastRequestedAt?: Date;
}
