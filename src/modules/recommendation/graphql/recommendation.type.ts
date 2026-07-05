import { Field, ObjectType } from "@nestjs/graphql";
import { DailyRecommendation } from "./daily-recommendation.type";

@ObjectType()
export class RecommendationResponse {
    @Field(() => Date, { nullable: true })
    lastRefreshedAt?: Date | null;

    @Field(() => [DailyRecommendation])
    dailyRecommendations!: DailyRecommendation[];
}