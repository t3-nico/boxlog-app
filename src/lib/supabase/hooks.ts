/**
 * Supabase 認証フック
 * @description React hooks for Supabase authentication
 *
 * @see Issue #531 - Supabase × Vercel × Next.js 認証チェックリスト
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import type { AuthError, Session, User } from '@supabase/supabase-js'

import type { Database } from '@/types/supabase'

import { createClient } from './client'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
// 注: Task型は削除済み（Ticketsに移行）

/**
 * 認証状態を管理するフック
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // 初期セッション取得
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }: { data: { session: Session | null }; error: AuthError | null }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setError(error)
        setLoading(false)
      })

    // 認証状態変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // メール・パスワードでサインイン
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const supabase = createClient()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setError(error)
    setLoading(false)
    return { data, error }
  }, [])

  // メール・パスワードでサインアップ
  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = createClient()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    setError(error)
    setLoading(false)
    return { data, error }
  }, [])

  // サインアウト
  const signOut = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setError(error)
    setLoading(false)
    return { error }
  }, [])

  // パスワードリセット
  const resetPassword = useCallback(async (email: string) => {
    const supabase = createClient()
    setLoading(true)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setError(error)
    setLoading(false)
    return { data, error }
  }, [])

  // パスワード更新
  const updatePassword = useCallback(async (password: string) => {
    const supabase = createClient()
    setLoading(true)
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
    setError(error)
    setLoading(false)
    return { data, error }
  }, [])

  // OAuthプロバイダーでサインイン
  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple' | 'github') => {
    const supabase = createClient()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setError(error)
    setLoading(false)
    return { data, error }
  }, [])

  return {
    user,
    session,
    loading,
    error,
    signInWithEmail,
    signInWithOAuth,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}

/**
 * プロフィール情報を管理するフック
 */
export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) return

    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      if (!user) return

      const supabase = createClient()
      try {
        setLoading(true)
        // Supabase型推論の既知の問題: Database型がfrom()に正しく伝播しない
        // 回避策: 明示的にDatabase型を使用してupdateDataを定義
        const updateData: Database['public']['Tables']['profiles']['Update'] = {
          ...updates,
        }
        // @ts-expect-error - Supabase型推論の問題（既知の問題、src/server/api/routers/profile.ts:44参照）
        const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id)

        if (error) throw error
        await fetchProfile()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile')
      } finally {
        setLoading(false)
      }
    },
    [user, fetchProfile]
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  }
}

/**
 * タスク管理フック
 */
// 注: useTasks関数は削除済み（Tickets/Sessions機能に移行）
// src/features/tickets/hooks/useTickets.tsを使用してください
