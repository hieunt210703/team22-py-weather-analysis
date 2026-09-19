import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { getCurrentUser } from '../api/auth'
import type { User } from '../types'

export const CURRENT_USER_QUERY_KEY = ['current-user'] as const

export function useCurrentUser(): UseQueryResult<User | null> {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
  })
}
