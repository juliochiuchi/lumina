import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { AuthContext } from './use-auth'
import { supabase } from '@/utils/supabase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    let unsub: (() => void) | undefined

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session)
      })

      unsub = () => sub.subscription.unsubscribe()
    }

    init()

    return () => {
      if (unsub) unsub()
    }
  }, [])

  const requestAccess = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)

      if (error) {
        toast.error('Falha ao validar e-mail')
        return
      }

      if (!data || data.length === 0) {
        toast.error('E-mail não cadastrado')
        return
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, requestAccess }}>
      {children}
    </AuthContext.Provider>
  )
}
