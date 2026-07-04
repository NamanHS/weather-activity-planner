import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { ActivityWeatherRule } from "./activity-weather-rule.entity";

@Entity('activities')
export class Activity extends BaseEntity {
  @Column({
    unique: true,
  })
  name!: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @OneToMany(
    () => ActivityWeatherRule,
    (rule) => rule.activity,
  )
  weatherRules!: ActivityWeatherRule[];
}