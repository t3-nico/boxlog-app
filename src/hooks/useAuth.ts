'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'

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
  const supabase = createClient()

  // エラーハンドリング関数
  const handleAuthError = useCallback((error: AuthError | null) => {
    if (!error) return null

    // エラーメッセージの日本語化
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
      'Email not confirmed': 'メールアドレスの確認が必要です',
      'User already registered': 'このメールアドレスは既に登録されています',
      'Password should be at least 6 characters': 'パスワードは6文字以上で入力してください',
      'Too many requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
      'Email rate limit exceeded': 'メール送信の制限に達しました。しばらく待ってから再試行してください',
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
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  }
} 