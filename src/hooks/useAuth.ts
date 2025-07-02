'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  // クライアント用supabaseインスタンス
  const supabase = supabaseBrowser()

  // エラーハンドリング関数
  const handleAuthError = useCallback((error: AuthError | null) => {
    if (!error) return null

    // エラーメッセージの日本語化
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. If you don\'t have an account, please sign up.',
      'Email not confirmed': 'Please confirm your email address.',
      'User already registered': 'This email address is already registered.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters.',
      'Too many requests': 'Too many requests. Please try again later.',
      'Email rate limit exceeded': 'Email sending limit exceeded. Please try again later.'
    }

    return errorMessages[error.message] || error.message
  }, [])

  useEffect(() => {
    // 現在のセッションを取得
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setAuthState(prev => ({
            ...prev,
            error: handleAuthError(error),
            loading: false,
          }))
          return
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          error: 'セッションの取得に失敗しました',
          loading: false,
        }))
      }
    }

    getSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user')
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [handleAuthError])

  const signUp = async (email: string, password: string, metadata?: any) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
        return { data, error: errorMessage }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const errorMessage = '登録中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
        return { data, error: errorMessage }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const errorMessage = 'ログイン中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        setAuthState((prev) => ({ ...prev, error: errorMessage, loading: false }))
        return { data, error: errorMessage }
      }

      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const errorMessage = 'OAuth login failed'
      setAuthState((prev) => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const errorMessage = handleAuthError(error)
        setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
        return { error: errorMessage }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const errorMessage = 'ログアウト中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
        return { data, error: errorMessage }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const errorMessage = 'パスワードリセット中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const updatePassword = async (password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
        return { data, error: errorMessage }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const errorMessage = 'パスワード更新中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { data: null, error: errorMessage }
    }
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  }
} 
