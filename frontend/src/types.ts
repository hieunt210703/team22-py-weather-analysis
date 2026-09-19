export interface User {
  username: string
}

export interface LocationItem {
  name: string
  slug: string
  region: string
  regionLabel: string
  tempOffset: number
  lat: number
  lon: number
}

export interface LocationImportResult {
  importedCount: number
}

export interface CityTemperatures {
  name: string
  temperatures: number[]
}

export interface TemperatureComparison {
  months: number[]
  cities: CityTemperatures[]
}
