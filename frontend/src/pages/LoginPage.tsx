import { type FormEvent, useState } from 'react'

import { login } from '../api/auth'
import type { User } from '../types'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      onLogin(await login(username, password))
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra, vui lòng thử lại',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Phân tích dữ liệu thời tiết</h1>
        <h2>Đăng nhập</h2>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-field">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
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
            <p className="error-message" role="alert">
              {errorMessage}
            </p>
          )}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  )
}
