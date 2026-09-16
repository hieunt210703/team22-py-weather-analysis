import type { TemperatureComparison } from './types'

export interface TemperatureChartRow {
  month: number
  temperatures: Record<string, number>
}

export function toChartRows(
  comparison: TemperatureComparison,
): TemperatureChartRow[] {
  return comparison.months.map((month, monthIndex) => ({
    month,
    temperatures: Object.fromEntries(
      comparison.cities.map((city) => [
        city.name,
        city.temperatures[monthIndex],
      ]),
    ),
  }))
}
