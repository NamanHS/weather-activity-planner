import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RecommendationInput {
  @Field()
  @IsString()
  cityName!: string;

  @Field()
  @IsString()
  countryCode!: string;
}
