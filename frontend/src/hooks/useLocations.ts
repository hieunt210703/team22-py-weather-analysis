import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'

import { getLocations, getPinnedLocations } from '../api/locations'
import type { LocationItem } from '../types'

export const LOCATIONS_QUERY_KEY = ['locations'] as const

export function useLocations(query = ''): UseQueryResult<LocationItem[]> {
  return useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, 'list', query],
    queryFn: () => getLocations(query),
    placeholderData: keepPreviousData,
  })
}

export function usePinnedLocations(): UseQueryResult<LocationItem[]> {
  return useQuery({
    queryKey: [...LOCATIONS_QUERY_KEY, 'pinned'],
    queryFn: getPinnedLocations,
  })
}
