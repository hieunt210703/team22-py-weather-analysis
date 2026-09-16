export interface User {
  username: string
}

export interface CityTemperatures {
  name: string
  temperatures: number[]
}

export interface TemperatureComparison {
  months: number[]
  cities: CityTemperatures[]
}
