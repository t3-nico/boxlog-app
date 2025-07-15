'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { User, Session, AuthResponse, AuthError } from '@supabase/supabase-js'

interface UserMetadata {
  [key: string]: string | number | boolean | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<AuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<AuthResponse>
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
    signUp: async () => ({ 
      data: { user: null, session: null }, 
      error: { message: 'Not available', name: 'NotImplemented', status: 500 } as AuthError 
    }),
    signIn: async () => ({ 
      data: { user: null, session: null }, 
      error: { message: 'Not available', name: 'NotImplemented', status: 500 } as AuthError 
    }),
    signInWithOAuth: async () => ({ 
      data: { user: null, session: null }, 
      error: { message: 'Not available', name: 'NotImplemented', status: 500 } as AuthError 
    }),
    signOut: async () => ({ 
      error: { message: 'Not available', name: 'NotImplemented', status: 500 } as AuthError 
    }),
    resetPassword: async () => ({ 
      error: { message: 'Not available', name: 'NotImplemented', status: 500 } as AuthError 
    }),
    updatePassword: async () => ({ 
      data: { user: null, session: null }, 
      error: { message: 'Not available', name: 'NotImplemented', status: 500 } as AuthError 
    }),
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