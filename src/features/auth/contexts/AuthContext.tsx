'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { AuthError, AuthResponse, OAuthResponse, Session, User } from '@supabase/supabase-js'

import { useAuth } from '@/lib/supabase'

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
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<OAuthResponse>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<AuthResponse>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Supabaseフックから状態を取得
  const { user, session, loading } = auth

  useEffect(() => {
    // Supabaseのエラーをローカル状態に同期
    if (auth.error) {
      setError(auth.error.message)
    }
  }, [auth.error])

  const signUp = async (email: string, password: string, _metadata?: UserMetadata): Promise<AuthResponse> => {
    const result = await auth.signUp(email, password)
    return result as AuthResponse
  }

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const result = await auth.signInWithEmail(email, password)
    return result as AuthResponse
  }

  const signInWithOAuth = async (provider: 'google' | 'apple'): Promise<OAuthResponse> => {
    const result = await auth.signInWithOAuth(provider)
    return result as OAuthResponse
  }

  const signOut = async () => {
    const result = await auth.signOut()
    return { error: result.error }
  }

  const resetPassword = async (email: string) => {
    const result = await auth.resetPassword(email)
    return { error: result.error }
  }

  const updatePassword = async (password: string): Promise<AuthResponse> => {
    const result = await auth.updatePassword(password)
    return result as AuthResponse
  }

  const clearError = () => {
    setError(null)
  }

  const authState: AuthContextType = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  }

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
