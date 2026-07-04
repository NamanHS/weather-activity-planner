import { BaseEntity } from "src/common/database/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { ActivityWeatherRule } from "./activity-weather-rule.entity";

@Entity('activities')
export class Activity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @OneToMany(
    () => ActivityWeatherRule,
    (rule) => rule.activity,
  )
  weatherRules!: ActivityWeatherRule[];
}