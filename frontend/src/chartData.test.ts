import { describe, expect, it } from 'vitest'

import { toChartRows } from './chartData'
import type { TemperatureComparison } from './types'

describe('toChartRows', () => {
  it('chuyển dữ liệu hai thành phố thành 12 dòng theo tháng', () => {
    const comparison: TemperatureComparison = {
      months: Array.from({ length: 12 }, (_, index) => index + 1),
      cities: [
        {
          name: 'Hà Nội',
          temperatures: [16.4, 17.2, 20.1, 24.2, 27.6, 29.3, 29.2, 28.6, 27.5, 24.9, 21.5, 18.2],
        },
        {
          name: 'TP.HCM',
          temperatures: [26, 26.8, 28, 29.1, 28.8, 27.8, 27.5, 27.4, 27.3, 27.2, 27, 26.2],
        },
      ],
    }

    const rows = toChartRows(comparison)

    expect(rows).toHaveLength(12)
    expect(rows[0]).toEqual({
      month: 1,
      temperatures: { 'Hà Nội': 16.4, 'TP.HCM': 26 },
    })
  })
})
