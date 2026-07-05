import { ActivityRecommendationRuleEngine } from '../../activity-recommendation-rule-engine.service';

import { ComparisonType } from 'src/common/enums/comparison-type.enum';
import { WeatherFactor } from 'src/common/enums/weather-factor.enum';
describe('ActivityRecommendationRuleEngine', () => {
  let engine: ActivityRecommendationRuleEngine;

  beforeEach(() => {
    engine = new ActivityRecommendationRuleEngine();
  });

  const weather = {
    date: '2026-07-05',
    temperatureMin: 24,
    temperatureMax: 30,
    temperatureMean: 27,
    precipitationProbability: 20,
    windSpeed: 15,
    condition: 'CLEAR',
  };

  const createActivity = (rules: any[]) =>
    ({
      weatherRules: rules,
    }) as any;

  describe('MIN comparison', () => {
    it('should award score when value is above minimum', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.TEMPERATURE,
          comparisonType: ComparisonType.MIN,
          valueFrom: 20,
          score: 30,
          penalty: 10,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(30);
    });

    it('should apply penalty when below minimum', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.TEMPERATURE,
          comparisonType: ComparisonType.MIN,
          valueFrom: 30,
          score: 30,
          penalty: 10,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(0);
    });
  });

  describe('MAX comparison', () => {
    it('should award score when below maximum', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.WIND_SPEED,
          comparisonType: ComparisonType.MAX,
          valueFrom: 20,
          score: 25,
          penalty: 5,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(25);
    });

    it('should apply penalty when above maximum', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.WIND_SPEED,
          comparisonType: ComparisonType.MAX,
          valueFrom: 10,
          score: 25,
          penalty: 15,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(0);
    });
  });

  describe('RANGE comparison', () => {
    it('should award score when value falls within range', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.TEMPERATURE,
          comparisonType: ComparisonType.RANGE,
          valueFrom: 25,
          valueTo: 30,
          score: 40,
          penalty: 20,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(40);
    });

    it('should apply penalty when outside range', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.TEMPERATURE,
          comparisonType: ComparisonType.RANGE,
          valueFrom: 10,
          valueTo: 20,
          score: 40,
          penalty: 20,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(0);
    });
  });

  describe('IN comparison', () => {
    it('should award score when value exists in comparison values', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.CONDITION,
          comparisonType: ComparisonType.IN,
          comparisonValues: ['CLEAR', 'PARTLY_CLOUDY'],
          score: 50,
          penalty: 30,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(50);
    });

    it('should apply penalty when value does not exist', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.CONDITION,
          comparisonType: ComparisonType.IN,
          comparisonValues: ['SNOW'],
          score: 50,
          penalty: 30,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(0);
    });
  });

  describe('multiple rules', () => {
    it('should aggregate scores across matching rules', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.TEMPERATURE,
          comparisonType: ComparisonType.RANGE,
          valueFrom: 20,
          valueTo: 30,
          score: 30,
          penalty: 10,
        },
        {
          weatherFactor: WeatherFactor.WIND_SPEED,
          comparisonType: ComparisonType.MAX,
          valueFrom: 20,
          score: 20,
          penalty: 5,
        },
        {
          weatherFactor: WeatherFactor.CONDITION,
          comparisonType: ComparisonType.IN,
          comparisonValues: ['CLEAR'],
          score: 50,
          penalty: 20,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(100);
    });

    it('should subtract penalties for failed rules', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.TEMPERATURE,
          comparisonType: ComparisonType.RANGE,
          valueFrom: 20,
          valueTo: 30,
          score: 30,
          penalty: 10,
        },
        {
          weatherFactor: WeatherFactor.CONDITION,
          comparisonType: ComparisonType.IN,
          comparisonValues: ['SNOW'],
          score: 50,
          penalty: 20,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(10);
    });

    it('should never return a negative score', () => {
      const activity = createActivity([
        {
          weatherFactor: WeatherFactor.CONDITION,
          comparisonType: ComparisonType.IN,
          comparisonValues: ['SNOW'],
          score: 10,
          penalty: 50,
        },
      ]);

      expect(engine.calculateScore(activity, weather)).toBe(0);
    });
  });
});
