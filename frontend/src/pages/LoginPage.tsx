import { type FormEvent, type JSX, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { login } from '../api/auth'
import { ApiError } from '../api/client'
import { BrandLogo } from '../components/BrandLogo'
import {
  CURRENT_USER_QUERY_KEY,
  useCurrentUser,
} from '../hooks/useCurrentUser'

export function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: currentUser, isPending } = useCurrentUser()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const user = await login(username, password)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      navigate('/admin', { replace: true })
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Có lỗi xảy ra, vui lòng thử lại',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg px-[22px] text-[13.5px] text-m2">
        Đang tải…
      </main>
    )
  }

  if (currentUser) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="min-h-screen bg-bg px-[22px] py-[40px] text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[400px] flex-col items-center justify-center gap-[18px]">
        <BrandLogo />

        <section className="w-full rounded-[24px] bg-card px-[26px] py-[28px] shadow-sh2 sm:px-[32px] sm:py-[32px]">
          <p className="mb-[6px] text-[11px] font-bold tracking-[0.12em] text-m3 uppercase">
            Khu vực quản trị
          </p>
          <h1 className="font-nunito text-[24px] leading-tight font-semibold">
            Đăng nhập
          </h1>
          <p className="mt-[7px] text-[13px] leading-relaxed text-m2">
            Dùng tài khoản quản trị viên để tiếp tục.
          </p>

          <form
            className="mt-[24px]"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="grid gap-[7px]">
              <label className="text-[12.5px] font-semibold text-m1" htmlFor="username">
                Tên đăng nhập
              </label>
              <input
                className="focus-ring w-full rounded-full border border-border bg-card px-[16px] py-[10px] text-[13.5px] shadow-sh1 outline-none"
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="mt-[16px] grid gap-[7px]">
              <label className="text-[12.5px] font-semibold text-m1" htmlFor="password">
                Mật khẩu
              </label>
              <input
                className="focus-ring w-full rounded-full border border-border bg-card px-[16px] py-[10px] text-[13.5px] shadow-sh1 outline-none"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {errorMessage !== null && (
              <p
                className="mt-[16px] flex items-start gap-[8px] rounded-[14px] bg-tint px-[13px] py-[11px] text-[12.5px] leading-relaxed text-ink2"
                role="alert"
              >
                <CircleAlert className="mt-[2px] h-[15px] w-[15px] shrink-0 text-acc" />
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              className="focus-ring mt-[20px] w-full rounded-full bg-acc px-[18px] py-[11px] text-[13.5px] font-bold text-acc-ink transition-opacity hover:opacity-90"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
        </section>

        <Link
          className="focus-ring rounded-md px-[6px] py-[3px] text-[12.5px] text-m1 transition-colors hover:text-acc"
          to="/"
        >
          ← Về trang thời tiết
        </Link>
      </div>
    </main>
  )
}
