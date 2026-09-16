import type { TemperatureComparison } from '../types'
import { requestJson } from './client'

export function getTemperatureComparison(): Promise<TemperatureComparison> {
  return requestJson<TemperatureComparison>('/api/temperatures/comparison')
}
