export interface OpenMeteoResponseDto {
  daily: {
    time: string[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    temperature_2m_mean: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
  };
}
