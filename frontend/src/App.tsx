import { useEffect, useState } from 'react'

import { getCurrentUser } from './api/auth'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import type { User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    void getCurrentUser()
      .then((currentUser) => {
        if (isActive) {
          setUser(currentUser)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  if (isLoading) {
    return <main className="centered-page">Đang tải...</main>
  }

  return user === null ? (
    <LoginPage onLogin={setUser} />
  ) : (
    <DashboardPage user={user} onLogout={() => setUser(null)} />
  )
}

export default App
