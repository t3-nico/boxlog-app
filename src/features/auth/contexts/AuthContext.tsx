'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
// import { User, Session, AuthResponse, AuthError } from '@supabase/supabase-js' // Disabled for localStorage-only mode
// import { createClient } from '@/lib/supabase/client' // Disabled for localStorage-only mode

// Temporary types for localStorage-only mode
interface User {
  id: string
  email?: string
}

interface Session {
  user: User
  access_token: string
}

interface AuthResponse {
  data: { user: User | null; session: Session | null }
  error: AuthError | null
}

interface AuthError {
  message: string
}

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ローカル専用モード: 自動的に仮のユーザーでログイン
    const initializeLocalAuth = () => {
      try {
        const savedUser = localStorage.getItem('boxlog-user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setSession({
            user: userData,
            access_token: 'local-token',
          })
        } else {
          // デフォルトユーザーを作成
          const defaultUser: User = {
            id: `local-user-${Date.now()}`,
            email: 'user@localhost',
          }
          localStorage.setItem('boxlog-user', JSON.stringify(defaultUser))
          setUser(defaultUser)
          setSession({
            user: defaultUser,
            access_token: 'local-token',
          })
        }
      } catch (err) {
        console.error('Failed to initialize local auth:', err)
        setError('Failed to initialize authentication')
      } finally {
        setLoading(false)
      }
    }

    initializeLocalAuth()
  }, [])

  const signUp = async (_email: string, _password: string, _metadata?: UserMetadata): Promise<AuthResponse> => {
    // ローカル専用モード: サインアップ無効
    return {
      data: { user: null, session: null },
      error: { message: 'Sign up disabled in local mode' },
    }
  }

  const signIn = async (_email: string, _password: string): Promise<AuthResponse> => {
    // ローカル専用モード: 常にログイン済み
    return {
      data: { user, session },
      error: null,
    }
  }

  const signInWithOAuth = async (_provider: 'google' | 'apple'): Promise<AuthResponse> => {
    // ローカル専用モード: OAuth無効
    return {
      data: { user: null, session: null },
      error: { message: 'OAuth disabled in local mode' },
    }
  }

  const signOut = async () => {
    // ローカル専用モード: ログアウト無効
    return { error: null }
  }

  const resetPassword = async (_email: string) => {
    // ローカル専用モード: パスワードリセット無効
    return { error: { message: 'Password reset disabled in local mode' } }
  }

  const updatePassword = async (_password: string): Promise<AuthResponse> => {
    // ローカル専用モード: パスワード更新無効
    return {
      data: { user: null, session: null },
      error: { message: 'Password update disabled in local mode' },
    }
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
