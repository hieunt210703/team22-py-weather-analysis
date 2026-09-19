import { type FormEvent, type JSX, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import {
  importLocations,
  LOCATIONS_SAMPLE_URL,
} from '../api/locations'
import { ApiError } from '../api/client'
import { LOCATIONS_QUERY_KEY } from '../hooks/useLocations'

const DEFAULT_ERROR_MESSAGE = 'Có lỗi xảy ra, vui lòng thử lại'

export function LocationImportForm(): JSX.Element {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setErrorMessage('Vui lòng chọn tệp CSV')
      return
    }

    setIsImporting(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const result = await importLocations(file)
      await queryClient.invalidateQueries({ queryKey: LOCATIONS_QUERY_KEY })
      setSuccessMessage(`Đã cập nhật ${result.importedCount} địa điểm`)
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE,
      )
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <section className="mt-[26px] border-t border-border pt-[24px]">
      <h2 className="font-nunito text-[18px] font-semibold">
        Nhập danh sách địa điểm
      </h2>
      <p className="mt-[7px] max-w-[760px] text-[13.5px] leading-relaxed text-m2">
        Tệp CSV mới sẽ thay thế toàn bộ danh sách hiện tại. Các cột bắt buộc:
        name, slug, region_code, region_label, temp_offset, latitude, longitude
        và pin_order.
      </p>

      <a
        className="focus-ring mt-[15px] inline-flex items-center gap-[7px] rounded-full border border-border bg-tint px-[14px] py-[8px] text-[12.5px] font-semibold text-m1 transition-colors hover:text-ink"
        href={LOCATIONS_SAMPLE_URL}
        download
      >
        <Download className="h-[14px] w-[14px]" />
        Tải tệp mẫu
      </a>

      <form
        className="mt-[18px] flex flex-wrap items-center gap-[10px]"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <input
          className="focus-ring min-w-0 flex-1 rounded-[12px] border border-border bg-tint px-[13px] py-[9px] text-[13px] text-m1 file:mr-[12px] file:rounded-full file:border-0 file:bg-acc-soft file:px-[12px] file:py-[6px] file:font-semibold file:text-acc"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            setSuccessMessage(null)
            setErrorMessage(null)
          }}
        />
        <button
          className="focus-ring inline-flex items-center gap-[7px] rounded-full bg-acc px-[17px] py-[10px] text-[13px] font-semibold text-accInk shadow-sh1 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isImporting}
        >
          <Upload className="h-[14px] w-[14px]" />
          {isImporting ? 'Đang tải lên…' : 'Tải lên và thay thế'}
        </button>
      </form>

      {successMessage && (
        <p
          className="mt-[14px] whitespace-pre-line rounded-[14px] bg-acc-soft px-[14px] py-[11px] text-[12.5px] text-acc"
          role="status"
        >
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p
          className="mt-[14px] whitespace-pre-line rounded-[14px] bg-tint px-[14px] py-[11px] text-[12.5px] text-ink2"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </section>
  )
}
