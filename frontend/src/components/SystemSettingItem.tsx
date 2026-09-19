import { type JSX, useEffect, useId, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError } from '../api/client'
import {
  resetSystemSetting,
  SYSTEM_SETTINGS_QUERY_KEY,
  updateSystemSetting,
} from '../api/systemSettings'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { SystemSetting } from '../types'

const SAVE_DELAY_MS = 600
const DEFAULT_ERROR_MESSAGE = 'Có lỗi xảy ra, vui lòng thử lại'

interface SystemSettingItemProps {
  setting: SystemSetting
}

function validateInteger(
  input: string,
  minimum: number,
  maximum: number,
): string | null {
  if (input.trim() === '' || !/^-?\d+$/.test(input.trim())) {
    return 'Giá trị phải là số nguyên'
  }

  const value = Number(input)
  if (!Number.isSafeInteger(value)) {
    return 'Giá trị phải là số nguyên'
  }
  if (value < minimum || value > maximum) {
    return `Giá trị phải từ ${minimum} đến ${maximum}`
  }
  return null
}

export function SystemSettingItem({
  setting,
}: SystemSettingItemProps): JSX.Element {
  const queryClient = useQueryClient()
  const inputId = useId()
  const [inputValue, setInputValue] = useState(String(setting.value))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const debouncedValue = useDebouncedValue(inputValue, SAVE_DELAY_MS)

  function updateCachedSetting(updatedSetting: SystemSetting) {
    queryClient.setQueryData<SystemSetting[]>(
      SYSTEM_SETTINGS_QUERY_KEY,
      (current) =>
        current?.map((item) =>
          item.key === updatedSetting.key ? updatedSetting : item,
        ),
    )
  }

  const updateMutation = useMutation({
    mutationFn: (value: number) => updateSystemSetting(setting.key, value),
    onMutate: () => setRequestError(null),
    onSuccess: updateCachedSetting,
    onError: (error: unknown) => {
      setRequestError(
        error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE,
      )
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => resetSystemSetting(setting.key),
    onMutate: () => setRequestError(null),
    onSuccess: (updatedSetting) => {
      setInputValue(String(updatedSetting.value))
      setValidationError(null)
      updateCachedSetting(updatedSetting)
    },
    onError: (error: unknown) => {
      setRequestError(
        error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE,
      )
    },
  })

  const { mutate: saveValue } = updateMutation

  useEffect(() => {
    const error = validateInteger(
      debouncedValue,
      setting.minimum,
      setting.maximum,
    )
    if (error !== null) {
      return
    }

    const value = Number(debouncedValue)
    if (value !== setting.value) {
      saveValue(value)
    }
  }, [
    debouncedValue,
    saveValue,
    setting.maximum,
    setting.minimum,
    setting.value,
  ])

  const shownError = validationError ?? requestError
  const isBusy = updateMutation.isPending || resetMutation.isPending

  return (
    <article
      className={`relative rounded-[16px] border bg-card px-[18px] py-[17px] ${
        setting.isModified ? 'border-acc/35' : 'border-border'
      }`}
    >
      {setting.isModified && (
        <span
          className="absolute top-[14px] bottom-[14px] left-0 w-[3px] rounded-r-full bg-acc"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-wrap items-start justify-between gap-x-[24px] gap-y-[14px]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[8px]">
            <label
              className="font-nunito text-[14px] font-semibold text-ink"
              htmlFor={inputId}
            >
              {setting.category}: {setting.title}
            </label>
            {setting.isModified && (
              <span className="rounded-full bg-acc-soft px-[9px] py-[3px] text-[10.5px] font-bold text-acc">
                Đã sửa
              </span>
            )}
          </div>
          <p className="mt-[6px] max-w-[720px] text-[12.5px] leading-relaxed text-m2">
            {setting.description}
          </p>
          <code className="mt-[8px] block text-[11.5px] text-m3">
            {setting.key}
          </code>
        </div>

        <div className="w-full sm:w-[220px]">
          <input
            id={inputId}
            className="focus-ring w-full rounded-[10px] border border-border bg-tint px-[12px] py-[9px] text-[13px] text-ink shadow-sh1"
            type="number"
            inputMode="numeric"
            min={setting.minimum}
            max={setting.maximum}
            step={1}
            value={inputValue}
            aria-invalid={shownError !== null}
            aria-describedby={shownError ? `${inputId}-error` : undefined}
            onChange={(event) => {
              const nextValue = event.target.value
              setInputValue(nextValue)
              setValidationError(
                validateInteger(nextValue, setting.minimum, setting.maximum),
              )
              setRequestError(null)
            }}
          />
          <div className="mt-[7px] flex min-h-[24px] items-start justify-between gap-[8px]">
            <div className="min-w-0">
              {shownError ? (
                <p
                  id={`${inputId}-error`}
                  className="text-[11.5px] leading-snug text-ink2"
                  role="alert"
                >
                  {shownError}
                </p>
              ) : updateMutation.isPending ? (
                <p className="text-[11.5px] text-m2" role="status">
                  Đang lưu…
                </p>
              ) : null}
            </div>
            <button
              className="focus-ring inline-flex shrink-0 items-center gap-[5px] rounded-full px-[7px] py-[3px] text-[11.5px] font-semibold text-acc transition-colors hover:bg-acc-soft disabled:text-m4"
              type="button"
              disabled={!setting.isModified || isBusy}
              aria-label={`Khôi phục mặc định cho ${setting.title}`}
              onClick={() => resetMutation.mutate()}
            >
              <RotateCcw className="h-[12px] w-[12px]" />
              Khôi phục mặc định
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
