import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/common/database/base.entity";


@Entity('cities')
export class City extends BaseEntity {
  @Column()
  name!: string;

  @Column()
  country!: string;

  @Column('decimal')
  latitude!: number;

  @Column('decimal')
  longitude!: number;

  @Column()
  timezone!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  weatherData?: Record<string, unknown>;

  @Column({
    name: 'refresh_interval_minutes',
  })
  refreshIntervalMinutes!: number;

  @Column({
    name: 'last_refreshed_at',
    nullable: true,
  })
  lastRefreshedAt?: Date;

  @Column({
    name: 'last_requested_at',
    nullable: true,
  })
  lastRequestedAt?: Date;
}
