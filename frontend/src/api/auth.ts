import type { User } from '../types'
import { ApiError, requestJson } from './client'

export function login(username: string, password: string): Promise<User> {
  return requestJson<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(): Promise<void> {
  return requestJson<void>('/api/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await requestJson<User>('/api/auth/me')
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}
