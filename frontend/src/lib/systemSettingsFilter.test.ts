import { describe, expect, it } from 'vitest'

import type { SystemSetting } from '../types'
import { filterSystemSettings } from './systemSettingsFilter'

const settings: SystemSetting[] = [
  {
    key: 'forecast.cacheDurationMinutes',
    category: 'Dự báo thời tiết',
    title: 'Thời gian lưu cache (phút)',
    description: 'Thời gian lưu kết quả dự báo từ Open-Meteo.',
    type: 'integer',
    value: 5,
    defaultValue: 30,
    minimum: 1,
    maximum: 1440,
    isModified: true,
  },
  {
    key: 'display.days',
    category: 'Hiển thị',
    title: 'Số ngày',
    description: 'Số ngày được hiển thị.',
    type: 'integer',
    value: 7,
    defaultValue: 7,
    minimum: 1,
    maximum: 14,
    isModified: false,
  },
]

describe('filterSystemSettings', () => {
  it.each([
    ['cache', ['forecast.cacheDurationMinutes']],
    ['open-meteo', ['forecast.cacheDurationMinutes']],
    ['forecast.', ['forecast.cacheDurationMinutes']],
    ['dự báo', ['forecast.cacheDurationMinutes']],
    ['hiển thị', ['display.days']],
  ])('lọc theo từ khóa %s', (query, expectedKeys) => {
    expect(filterSystemSettings(settings, query).map((item) => item.key)).toEqual(
      expectedKeys,
    )
  })

  it('lọc các cài đặt đã sửa bằng @modified', () => {
    expect(filterSystemSettings(settings, '@modified')).toEqual([settings[0]])
  })

  it('kết hợp @modified với từ khóa', () => {
    expect(filterSystemSettings(settings, '@modified cache')).toEqual([
      settings[0],
    ])
    expect(filterSystemSettings(settings, '@modified hiển thị')).toEqual([])
  })

  it('trả về toàn bộ cài đặt khi từ khóa trống', () => {
    expect(filterSystemSettings(settings, '   ')).toEqual(settings)
  })
})
