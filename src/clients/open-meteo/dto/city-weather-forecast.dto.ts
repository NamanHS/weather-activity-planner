export interface WeatherForecastEntry {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  temperatureMean: number;
  precipitationProbability: number;
  condition: string;
  windSpeed: number;
}

export interface CityWeatherForecast {
  forecasts: WeatherForecastEntry[];
}
