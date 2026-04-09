import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { AuthContext, type AuthUser } from './use-auth'
import { supabase } from '@/utils/supabase'

const AUTH_MAX_AGE_MS = 3 * 60 * 60 * 1000
const AUTH_STARTED_AT_KEY = 'lumina:auth_started_at'

async function lookupAuthUserByEmail(email: string): Promise<{ user: AuthUser | null; error: unknown | null }> {
  const { data, error } = await supabase
    .from('users')
    .select('email, rules_admin')
    .eq('email', email)
    .maybeSingle()

  if (error) return { user: null, error }
  if (!data) return { user: null, error: null }

  return {
    user: {
      email: data.email ?? email,
      rules_admin: data.rules_admin === true,
    },
    error: null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const expirationTimeoutRef = useRef<number | null>(null)
  const lastSyncedEmailRef = useRef<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined
    let disposed = false
    const clearExpirationTimeout = () => {
      if (expirationTimeoutRef.current !== null) {
        window.clearTimeout(expirationTimeoutRef.current)
        expirationTimeoutRef.current = null
      }
    }

    const setAuthStartedAt = (value: number) => {
      try {
        localStorage.setItem(AUTH_STARTED_AT_KEY, String(value))
      } catch {
        return
      }
    }

    const clearAuthStartedAt = () => {
      try {
        localStorage.removeItem(AUTH_STARTED_AT_KEY)
      } catch {
        return
      }
    }

    const getAuthStartedAt = () => {
      try {
        const raw = localStorage.getItem(AUTH_STARTED_AT_KEY)
        if (!raw) return null
        const parsed = Number(raw)
        if (!Number.isFinite(parsed)) return null
        return parsed
      } catch {
        return null
      }
    }

    const scheduleExpiration = (msUntilExpire: number) => {
      clearExpirationTimeout()
      expirationTimeoutRef.current = window.setTimeout(async () => {
        clearExpirationTimeout()
        clearAuthStartedAt()
        await supabase.auth.signOut()
        toast.error('Sessão expirada. Entre novamente.')
      }, msUntilExpire)
    }

    const syncUserFromSession = async (session: Session) => {
      const email = session.user.email
      if (!email) {
        if (!disposed) {
          lastSyncedEmailRef.current = null
          setUser(null)
        }
        return
      }

      const lookup = await lookupAuthUserByEmail(email)
      if (disposed) return

      if (!lookup.error) lastSyncedEmailRef.current = email
      setUser(lookup.user ?? { email, rules_admin: false })
    }

    const enforceMaxSessionAge = async (session: Session | null, resetStart: boolean) => {
      if (!session) {
        clearExpirationTimeout()
        clearAuthStartedAt()
        setIsAuthenticated(false)
        setUser(null)
        lastSyncedEmailRef.current = null
        return
      }

      let startedAt = getAuthStartedAt()
      if (resetStart || startedAt === null) {
        startedAt = Date.now()
        setAuthStartedAt(startedAt)
      }

      const msUntilExpire = startedAt + AUTH_MAX_AGE_MS - Date.now()
      if (msUntilExpire <= 0) {
        clearExpirationTimeout()
        clearAuthStartedAt()
        await supabase.auth.signOut()
        toast.error('Sessão expirada. Entre novamente.')
        setIsAuthenticated(false)
        setUser(null)
        return
      }

      scheduleExpiration(msUntilExpire)
      setIsAuthenticated(true)
      const email = session.user.email
      if (email && (resetStart || lastSyncedEmailRef.current !== email)) {
        await syncUserFromSession(session)
      }
    }

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      await enforceMaxSessionAge(data.session, false)

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        void enforceMaxSessionAge(session, _event === 'SIGNED_IN')
      })

      unsub = () => sub.subscription.unsubscribe()
    }

    init()

    return () => {
      disposed = true
      clearExpirationTimeout()
      if (unsub) unsub()
    }
  }, [])

  const requestAccess = async (email: string) => {
    try {
      const normalizedEmail = email.trim()
      const lookup = await lookupAuthUserByEmail(normalizedEmail)

      if (lookup.error) {
        toast.error('Falha ao validar e-mail')
        return
      }

      if (!lookup.user) {
        toast.error('E-mail não cadastrado')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (signInError) {
        toast.error('Não foi possível enviar o link de acesso')
        return
      }

      toast.success('Enviamos um link de acesso para seu e-mail')
    } catch {
      toast.error('Erro ao solicitar acesso')
    }
  }

  const logout = async () => {
    try {
      try {
        localStorage.removeItem(AUTH_STARTED_AT_KEY)
      } catch {
        ;
      }
      if (expirationTimeoutRef.current !== null) {
        window.clearTimeout(expirationTimeoutRef.current)
        expirationTimeoutRef.current = null
      }
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Não foi possível sair')
        return
      }
      setIsAuthenticated(false)
      setUser(null)
      lastSyncedEmailRef.current = null
      toast.success('Sessão encerrada')
    } catch {
      toast.error('Não foi possível sair')
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin: user?.rules_admin === true, requestAccess, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
