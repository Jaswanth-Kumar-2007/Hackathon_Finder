import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { User } from '../types'

interface RegisterInput {
  name: string
  email: string
  username?: string
  password: string
  interests?: string[]
}

import { authApi } from '../services/api'
import { useToast } from './ToastContext'

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  loginWithProvider: (provider: 'Google' | 'GitHub') => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

/**
 * Frontend authentication state using localStorage for session persistence.
 * Restores the authenticated user on page refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // Restore user from localStorage on mount (or from authApi if available)
  const [user, setUser] = useState<User | null>(() => authApi.getSession())

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await authApi.login(email, password)
      setUser(u)
      toast('Logged in successfully')
    },
    [toast],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      const u = await authApi.register(input)
      setUser(u)
      toast('Account created. Welcome aboard!')
    },
    [toast],
  )

  const loginWithProvider = useCallback(
    async (_provider: 'Google' | 'GitHub') => {
      throw new Error('OAuth login is not implemented yet.')
    },
    [],
  )

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    toast('Logged out', 'info')
  }, [toast])

  const value = useMemo(
    () => ({ user, login, register, loginWithProvider, logout }),
    [user, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}