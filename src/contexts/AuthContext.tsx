'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { User, Session, AuthResponse, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Failed to get session:', error)
          setError(error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Unexpected error getting session:', err)
        setError('認証の初期化でエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setError(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase.auth])

  const signUp = async (email: string, password: string, metadata?: UserMetadata): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = 'サインアップでエラーが発生しました'
      setError(errorMessage)
      return {
        data: { user: null, session: null },
        error: { message: errorMessage, name: 'UnexpectedError', status: 500 } as AuthError
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = 'ログインでエラーが発生しました'
      setError(errorMessage)
      return {
        data: { user: null, session: null },
        error: { message: errorMessage, name: 'UnexpectedError', status: 500 } as AuthError
      }
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple'): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (response.error) {
        setError(response.error.message)
        return {
          data: { user: null, session: null },
          error: response.error
        }
      }
      
      // OAuth の場合はリダイレクトするため、成功レスポンスを返す
      return {
        data: { user: null, session: null },
        error: null
      }
    } catch (err) {
      const errorMessage = `${provider} ログインでエラーが発生しました`
      setError(errorMessage)
      return {
        data: { user: null, session: null },
        error: { message: errorMessage, name: 'UnexpectedError', status: 500 } as AuthError
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
      }
      return { error }
    } catch (err) {
      const errorMessage = 'ログアウトでエラーが発生しました'
      setError(errorMessage)
      return { error: { message: errorMessage, name: 'UnexpectedError', status: 500 } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      
      if (error) {
        setError(error.message)
      }
      
      return { error }
    } catch (err) {
      const errorMessage = 'パスワードリセットでエラーが発生しました'
      setError(errorMessage)
      return { error: { message: errorMessage, name: 'UnexpectedError', status: 500 } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await supabase.auth.updateUser({ password })
      
      if (response.error) {
        setError(response.error.message)
        return {
          data: { user: null, session: null },
          error: response.error
        }
      }
      
      // UserResponseをAuthResponseに変換
      return {
        data: { user: response.data.user, session: null },
        error: null
      }
    } catch (err) {
      const errorMessage = 'パスワード更新でエラーが発生しました'
      setError(errorMessage)
      return {
        data: { user: null, session: null },
        error: { message: errorMessage, name: 'UnexpectedError', status: 500 } as AuthError
      }
    } finally {
      setLoading(false)
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
    clearError
  }

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