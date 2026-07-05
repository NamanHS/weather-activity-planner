import { Resolver, Query, Args } from '@nestjs/graphql';

import { RecommendationService } from './recommendation.service';

import { RecommendationResponse } from './graphql/recommendation.type';
import { RecommendationInput } from './graphql/recommendation.input';

@Resolver()
export class RecommendationResolver {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Query(() => RecommendationResponse)
  async activityRecommendations(
    @Args('input') input: RecommendationInput,
  ): Promise<RecommendationResponse> {
    return this.recommendationService.getRecommendations(input);
  }
}
