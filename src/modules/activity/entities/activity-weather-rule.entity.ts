import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Activity } from "./activity.entity";
import { BaseEntity } from "src/common/database/base.entity";
import { WeatherFactor } from "src/common/enums/weather-factor.enum";
import { ComparisonType } from "src/common/enums/comparison-type.enum";

@Entity('activity_weather_rules')
export class ActivityWeatherRule extends BaseEntity {
  @ManyToOne(
    () => Activity,
    (activity) => activity.weatherRules,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'activity_id',
  })
  activity!: Activity;

  @Column({
    type: 'enum',
    enum: WeatherFactor,
    name: 'weather_factor',
  })
  weatherFactor!: WeatherFactor;

  @Column({
    type: 'enum',
    enum: ComparisonType,
    name: 'comparison_type',
  })
  comparisonType!: ComparisonType;

  @Column({
    name: 'value_from',
    type: 'numeric',
    nullable: true,
  })
  valueFrom?: number;

  @Column({
    name: 'value_to',
    type: 'numeric',
    nullable: true,
  })
  valueTo?: number;

  @Column({
    name: 'comparison_values',
    type: 'jsonb',
    nullable: true,
  })
  comparisonValues?: number[];

  @Column()
  score!: number;

  @Column({
    default: 0,
  })
  penalty!: number;
}