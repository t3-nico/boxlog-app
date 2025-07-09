'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'

interface AuthContextType {
  user: any
  session: any
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (password: string) => Promise<any>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  const authState: AuthContextType = {
    user: null,
    session: null,
    loading: false,
    error: null,
    signUp: async () => ({ data: null, error: 'Not available' }),
    signIn: async () => ({ data: null, error: 'Not available' }),
    signInWithOAuth: async () => ({ data: null, error: 'Not available' }),
    signOut: async () => ({ error: null }),
    resetPassword: async () => ({ data: null, error: 'Not available' }),
    updatePassword: async () => ({ data: null, error: 'Not available' }),
    clearError: () => {},
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}