import { describe, expect, it } from 'vitest'

import type { LocationItem } from '../types'
import { findLocationBySlug, findNearestLocation } from './locations'


const locations: LocationItem[] = [
  {
    name: 'Hà Nội',
    slug: 'ha-noi',
    region: 'dbbb',
    regionLabel: 'Đồng bằng Bắc Bộ',
    tempOffset: 0,
    lat: 21.0285,
    lon: 105.8542,
  },
  {
    name: 'Đà Nẵng',
    slug: 'da-nang',
    region: 'trungtrung',
    regionLabel: 'Trung Trung Bộ',
    tempOffset: 0,
    lat: 16.0544,
    lon: 108.2022,
  },
]

describe('location helpers', () => {
  it('tìm theo slug và fallback về Hà Nội', () => {
    expect(findLocationBySlug(locations, 'da-nang')?.name).toBe('Đà Nẵng')
    expect(findLocationBySlug(locations, 'khong-ton-tai')?.name).toBe('Hà Nội')
  })

  it('fallback về phần tử đầu khi danh sách không có Hà Nội', () => {
    expect(findLocationBySlug(locations.slice(1), 'khong-ton-tai')?.name).toBe(
      'Đà Nẵng',
    )
  })

  it('tìm địa điểm gần tọa độ nhất', () => {
    expect(findNearestLocation(locations, 16.05, 108.2)?.slug).toBe('da-nang')
    expect(findNearestLocation([], 16.05, 108.2)).toBeUndefined()
  })
})
