import { createContext, useContext } from 'react'

export interface AuthContextType {
  isAuthenticated: boolean
  login: (code: string) => boolean
  checkAuth: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
