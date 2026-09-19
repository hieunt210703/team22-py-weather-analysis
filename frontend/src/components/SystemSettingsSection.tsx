import { type JSX, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { ApiError } from '../api/client'
import {
  getSystemSettings,
  SYSTEM_SETTINGS_QUERY_KEY,
} from '../api/systemSettings'
import { filterSystemSettings } from '../lib/systemSettingsFilter'
import type { SystemSetting } from '../types'
import { SystemSettingItem } from './SystemSettingItem'

function groupSettings(
  settings: SystemSetting[],
): Array<[string, SystemSetting[]]> {
  const groups = new Map<string, SystemSetting[]>()
  for (const setting of settings) {
    const group = groups.get(setting.category) ?? []
    group.push(setting)
    groups.set(setting.category, group)
  }
  return [...groups.entries()]
}

export function SystemSettingsSection(): JSX.Element {
  const [query, setQuery] = useState('')
  const settingsQuery = useQuery({
    queryKey: SYSTEM_SETTINGS_QUERY_KEY,
    queryFn: getSystemSettings,
  })
  const groups = useMemo(
    () => groupSettings(filterSystemSettings(settingsQuery.data ?? [], query)),
    [query, settingsQuery.data],
  )

  return (
    <section className="mt-[26px] border-t border-border pt-[24px]">
      <h2 className="font-nunito text-[18px] font-semibold">
        Cài đặt hệ thống
      </h2>
      <p className="mt-[7px] max-w-[760px] text-[13.5px] leading-relaxed text-m2">
        Các thay đổi hợp lệ được tự động lưu. Nhập{' '}
        <code className="text-[12.5px] text-m1">@modified</code> để chỉ xem
        những cài đặt đã sửa.
      </p>

      <div className="relative mt-[16px] max-w-[620px]">
        <label className="sr-only" htmlFor="system-settings-search">
          Tìm kiếm cài đặt
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-[13px] h-[15px] w-[15px] -translate-y-1/2 text-m3"
          aria-hidden="true"
        />
        <input
          id="system-settings-search"
          className="focus-ring w-full rounded-[12px] border border-border bg-tint py-[10px] pr-[13px] pl-[38px] text-[13px] text-ink shadow-sh1 placeholder:text-m4"
          type="search"
          placeholder="Tìm theo tên, mô tả, key hoặc @modified"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {settingsQuery.isPending ? (
        <p className="mt-[18px] text-[13px] text-m2" role="status">
          Đang tải cài đặt…
        </p>
      ) : settingsQuery.isError ? (
        <p
          className="mt-[18px] rounded-[14px] bg-tint px-[14px] py-[11px] text-[12.5px] text-ink2"
          role="alert"
        >
          {settingsQuery.error instanceof ApiError
            ? settingsQuery.error.message
            : 'Có lỗi xảy ra, vui lòng thử lại'}
        </p>
      ) : groups.length === 0 ? (
        <p className="mt-[18px] text-[13px] text-m2">
          Không có cài đặt phù hợp.
        </p>
      ) : (
        <div className="mt-[20px] space-y-[22px]">
          {groups.map(([category, settings]) => (
            <div key={category}>
              <h3 className="mb-[9px] text-[11.5px] font-bold tracking-[0.08em] text-m3 uppercase">
                {category}
              </h3>
              <div className="space-y-[9px]">
                {settings.map((setting) => (
                  <SystemSettingItem key={setting.key} setting={setting} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
