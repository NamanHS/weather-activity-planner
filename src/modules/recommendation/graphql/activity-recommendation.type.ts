import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActivityRecommendation {
  @Field()
  activityName!: string;

  @Field({ nullable: true })
  activityDescription?: string;

  @Field()
  score!: number;
}
