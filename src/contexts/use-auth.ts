import { createContext, useContext } from 'react'

export interface AuthUser {
  email: string
  rules_admin: boolean
}

export interface AuthContextType {
  isAuthenticated: boolean
  user: AuthUser | null
  isAdmin: boolean
  requestAccess: (email: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
