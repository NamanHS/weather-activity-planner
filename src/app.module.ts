import { Module } from '@nestjs/common';
import { CityModule } from './modules/city/city.module';
import { ActivityModule } from './modules/activity/activity.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { graphqlErrorMapper } from './common/errors/graphql-error.mapper';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      formatError: graphqlErrorMapper,
    }),
    ScheduleModule.forRoot(),
    ConfigModule,
    DatabaseModule,
    CityModule,
    ActivityModule,
    RecommendationModule,
    SchedulerModule,
  ],
})
export class AppModule {}
