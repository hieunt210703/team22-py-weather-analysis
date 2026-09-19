import type { LocationImportResult, LocationItem } from '../types'
import { requestJson } from './client'

export const DEFAULT_LOCATION_SLUG = 'ha-noi'
export const LOCATIONS_SAMPLE_URL = '/api/admin/locations/sample'

export function getLocations(query?: string): Promise<LocationItem[]> {
  const search = query ? `?q=${encodeURIComponent(query)}` : ''
  return requestJson<LocationItem[]>(`/api/locations${search}`)
}

export function getPinnedLocations(): Promise<LocationItem[]> {
  return requestJson<LocationItem[]>('/api/locations/pinned')
}

export function importLocations(file: File): Promise<LocationImportResult> {
  const body = new FormData()
  body.append('file', file)
  return requestJson<LocationImportResult>('/api/admin/locations/import', {
    method: 'POST',
    body,
  })
}

export function findLocationBySlug(
  locations: LocationItem[],
  slug: string,
): LocationItem | undefined {
  return (
    locations.find((location) => location.slug === slug) ??
    locations.find((location) => location.slug === DEFAULT_LOCATION_SLUG) ??
    locations[0]
  )
}

export function findLocationByName(
  locations: LocationItem[],
  name: string,
): LocationItem | undefined {
  const normalizedName = name.toLocaleLowerCase('vi')
  return locations.find(
    (location) => location.name.toLocaleLowerCase('vi') === normalizedName,
  )
}

export function findNearestLocation(
  locations: LocationItem[],
  lat: number,
  lon: number,
): LocationItem | undefined {
  let nearest: LocationItem | undefined
  let minDistance = Number.POSITIVE_INFINITY
  const toRadians = (value: number) => (value * Math.PI) / 180

  for (const location of locations) {
    const latitudeDelta = toRadians(location.lat - lat)
    const longitudeDelta = toRadians(location.lon - lon)
    const distanceFactor =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(toRadians(lat)) *
        Math.cos(toRadians(location.lat)) *
        Math.sin(longitudeDelta / 2) ** 2
    const angularDistance =
      2 * Math.atan2(Math.sqrt(distanceFactor), Math.sqrt(1 - distanceFactor))
    const distance = 6371 * angularDistance
    if (distance < minDistance) {
      minDistance = distance
      nearest = location
    }
  }
  return nearest
}
