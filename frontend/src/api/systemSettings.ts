import type { SystemSetting } from '../types'
import { requestJson } from './client'

export const SYSTEM_SETTINGS_QUERY_KEY = ['system-settings'] as const

export function getSystemSettings(): Promise<SystemSetting[]> {
  return requestJson<SystemSetting[]>('/api/admin/settings')
}

export function updateSystemSetting(
  key: string,
  value: number,
): Promise<SystemSetting> {
  return requestJson<SystemSetting>(
    `/api/admin/settings/${encodeURIComponent(key)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ value }),
    },
  )
}

export function resetSystemSetting(key: string): Promise<SystemSetting> {
  return requestJson<SystemSetting>(
    `/api/admin/settings/${encodeURIComponent(key)}`,
    { method: 'DELETE' },
  )
}
