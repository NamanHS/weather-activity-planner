import { WeatherCondition } from 'src/common/enums/weather-condition.enum';

export const WEATHER_CODE_MAPPING: Record<number, WeatherCondition> = {
  // Clear
  0: WeatherCondition.CLEAR,

  // Clouds
  1: WeatherCondition.PARTLY_CLOUDY,
  2: WeatherCondition.PARTLY_CLOUDY,
  3: WeatherCondition.OVERCAST,

  // Fog
  45: WeatherCondition.FOG,
  48: WeatherCondition.FOG,

  // Drizzle
  51: WeatherCondition.DRIZZLE,
  53: WeatherCondition.DRIZZLE,
  55: WeatherCondition.DRIZZLE,

  // Freezing drizzle
  56: WeatherCondition.FREEZING_RAIN,
  57: WeatherCondition.FREEZING_RAIN,

  // Rain
  61: WeatherCondition.RAIN,
  63: WeatherCondition.RAIN,
  65: WeatherCondition.HEAVY_RAIN,

  // Freezing rain
  66: WeatherCondition.FREEZING_RAIN,
  67: WeatherCondition.FREEZING_RAIN,

  // Snow
  71: WeatherCondition.SNOW,
  73: WeatherCondition.SNOW,
  75: WeatherCondition.SNOW,
  77: WeatherCondition.SNOW,

  // Rain showers
  80: WeatherCondition.RAIN_SHOWERS,
  81: WeatherCondition.RAIN_SHOWERS,
  82: WeatherCondition.RAIN_SHOWERS,

  // Snow showers
  85: WeatherCondition.SNOW_SHOWERS,
  86: WeatherCondition.SNOW_SHOWERS,

  // Thunderstorm
  95: WeatherCondition.THUNDERSTORM,
  96: WeatherCondition.THUNDERSTORM,
  99: WeatherCondition.THUNDERSTORM,
};
