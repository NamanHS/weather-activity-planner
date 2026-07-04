export interface WeatherForecastEntry {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface CityWeatherForecast {
  forecasts: WeatherForecastEntry[];
}
