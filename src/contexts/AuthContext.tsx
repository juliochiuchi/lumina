import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { AuthContext } from './use-auth'

const AUTH_STORAGE_KEY = 'lumina_auth_timestamp'
const AUTH_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const checkAuth = () => {
    const timestamp = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!timestamp) {
      setIsAuthenticated(false)
      return
    }

    const now = Date.now()
    const authTime = parseInt(timestamp, 10)

    if (now - authTime < AUTH_DURATION) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const login = (code: string): boolean => {
    const validCode = import.meta.env.VITE_ACCESS_CODE

    if (code === validCode) {
      localStorage.setItem(AUTH_STORAGE_KEY, Date.now().toString())
      setIsAuthenticated(true)
      toast.success('Acesso autorizado com sucesso!')
      return true
    } else {
      toast.error('Código incorreto')
      return false
    }
  }

  // Initial check on mount
  useEffect(() => {
    checkAuth()

    // Optional: Set up an interval to check expiration while the app is open
    const interval = setInterval(checkAuth, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
