import { CityWeatherForecast } from 'src/clients/open-meteo/dto/city-weather-forecast.dto';

export interface CityForecastResponse {
  forecast: CityWeatherForecast;
  lastRefreshedAt: Date | null;
}
