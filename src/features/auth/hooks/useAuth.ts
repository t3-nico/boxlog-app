'use client'

import { useEffect, useState } from 'react'

import type { Session, User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

/**
 * Supabase認証フック
 *
 * Client Componentsで認証状態を管理するカスタムフック
 *
 * 使用例:
 * ```tsx
 * 'use client'
 * import { useAuth } from '@/features/auth/hooks/useAuth'
 *
 * export function ProfilePage() {
 *   const { user, loading, signOut } = useAuth()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Not logged in</div>
 *
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        error: null,
      })
    })

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        error: null,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (result.error) {
      setAuthState((prev) => ({ ...prev, error: result.error?.message ?? null }))
    }

    return result
  }

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (result.error) {
      setAuthState((prev) => ({ ...prev, error: result.error?.message ?? null }))
    }

    return result
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (result.error) {
      setAuthState((prev) => ({ ...prev, error: result.error?.message ?? null }))
    }

    return result
  }

  const signOut = async () => {
    const result = await supabase.auth.signOut()

    if (result.error) {
      setAuthState((prev) => ({ ...prev, error: result.error?.message ?? null }))
    }

    return result
  }

  const resetPassword = async (email: string) => {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (result.error) {
      setAuthState((prev) => ({ ...prev, error: result.error?.message ?? null }))
    }

    return result
  }

  const updatePassword = async (password: string) => {
    const result = await supabase.auth.updateUser({
      password,
    })

    if (result.error) {
      setAuthState((prev) => ({ ...prev, error: result.error?.message ?? null }))
    }

    return result
  }

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }))
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
