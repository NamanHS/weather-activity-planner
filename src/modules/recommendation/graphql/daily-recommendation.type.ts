import { Field, ObjectType } from "@nestjs/graphql";
import { DailyWeather } from "./daily-weather.type";
import { ActivityRecommendation } from "./activity-recommendation.type";

@ObjectType()
export class DailyRecommendation {

    @Field()
    date!: string;

    @Field(() => DailyWeather)
    weather!: DailyWeather;

    @Field(() => [ActivityRecommendation])
    activities!: ActivityRecommendation[];
}