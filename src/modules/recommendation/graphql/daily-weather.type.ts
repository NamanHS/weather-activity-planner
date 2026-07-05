import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DailyWeather {

    @Field()
    temperatureMin!: number;

    @Field()
    temperatureMax!: number;

    @Field()
    temperatureMean!: number;

    @Field()
    precipitationProbability!: number;

    @Field()
    condition!: string;

    @Field()
    windSpeed!: number;
}