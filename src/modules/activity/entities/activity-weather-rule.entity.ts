import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Activity } from "./activity.entity";
import { BaseEntity } from "src/common/database/base.entity";
import { ComparisonType } from "src/common/enums/comparison-type.enum";
import { WeatherFactor } from "src/common/enums/weather-factor.enum";

@Entity('activity_weather_rules')
export class ActivityWeatherRule extends BaseEntity {
  @ManyToOne(
    () => Activity,
    (activity) => activity.weatherRules,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  activity!: Activity;

  @Column({
    type: 'enum',
    enum: WeatherFactor,
  })
  weatherFactor!: WeatherFactor;

  @Column({
    type: 'enum',
    enum: ComparisonType,
  })
  comparisonType!: ComparisonType;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valueFrom?: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valueTo?: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  comparisonValues?: number[];

  @Column({
    type: 'integer',
  })
  score!: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  penalty!: number;
}