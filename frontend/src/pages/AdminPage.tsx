import { type JSX, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

import { logout } from '../api/auth'
import { ApiError } from '../api/client'
import { BrandLogo } from '../components/BrandLogo'
import { LocationImportForm } from '../components/LocationImportForm'
import {
  CURRENT_USER_QUERY_KEY,
  useCurrentUser,
} from '../hooks/useCurrentUser'

export function AdminPage(): JSX.Element {
  const queryClient = useQueryClient()
  const { data: currentUser, isPending } = useCurrentUser()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setErrorMessage(null)
    setIsLoggingOut(true)

    try {
      await logout()
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null)
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Có lỗi xảy ra, vui lòng thử lại',
      )
      setIsLoggingOut(false)
    }
  }

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg px-[22px] text-[13.5px] text-m2">
        Đang tải…
      </main>
    )
  }

  if (!currentUser) {
    return <Navigate to="/admin/dang-nhap" replace />
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto max-w-[1080px] px-[22px] pt-[26px] pb-[80px]">
        <header className="flex flex-wrap items-center justify-between gap-[14px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <BrandLogo />
            <span className="rounded-full bg-acc-soft px-[17px] py-[8px] text-[13.5px] font-bold text-acc">
              Quản trị
            </span>
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-[8px]">
            <Link
              className="focus-ring rounded-full px-[14px] py-[8px] text-[12.5px] text-m1 transition-colors hover:text-acc"
              to="/"
            >
              Xem trang thời tiết
            </Link>
            <button
              className="focus-ring flex items-center gap-[7px] rounded-full border border-border bg-card px-[14px] py-[8px] text-[12.5px] font-semibold text-m1 shadow-sh1 transition-colors hover:text-ink"
              type="button"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
            >
              <LogOut className="h-[14px] w-[14px]" />
              {isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
            </button>
          </div>
        </header>

        {errorMessage !== null && (
          <p
            className="mt-[18px] rounded-[14px] bg-tint px-[14px] py-[11px] text-[12.5px] text-ink2"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <main className="mt-[30px] rounded-[24px] bg-card px-[26px] py-[28px] shadow-sh2 sm:px-[32px] sm:py-[32px]">
          <h1 className="font-nunito text-[24px] leading-tight font-semibold">
            Xin chào, {currentUser.username}
          </h1>
          <p className="mt-[9px] max-w-[720px] text-[13.5px] leading-relaxed text-m2">
            Quản lý dữ liệu được dùng trên trang phân tích thời tiết.
          </p>
          <LocationImportForm />
        </main>
      </div>
    </div>
  )
}
