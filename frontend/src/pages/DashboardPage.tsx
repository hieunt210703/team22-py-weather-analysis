import { useEffect, useState } from 'react'

import { logout } from '../api/auth'
import { getTemperatureComparison } from '../api/temperatures'
import { TemperatureChart } from '../components/TemperatureChart'
import type { TemperatureComparison, User } from '../types'

interface DashboardPageProps {
  user: User
  onLogout: () => void
}

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [comparison, setComparison] = useState<TemperatureComparison | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isActive = true

    void getTemperatureComparison()
      .then((data) => {
        if (isActive) {
          setComparison(data)
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Có lỗi xảy ra, vui lòng thử lại',
          )
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
      onLogout()
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Có lỗi xảy ra, vui lòng thử lại',
      )
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div>
            <h1>So sánh nhiệt độ trung bình theo tháng</h1>
            <p>Xin chào, {user.username}!</p>
          </div>
          <button
            className="secondary-button"
            type="button"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
          >
            Đăng xuất
          </button>
        </header>

        {errorMessage !== null ? (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        ) : comparison === null ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <TemperatureChart comparison={comparison} />
        )}
      </section>
    </main>
  )
}
