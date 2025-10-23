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
type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

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
export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!user) return

    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createTask = useCallback(
    async (task: TaskInsert) => {
      if (!user) return

      const supabase = createClient()
      try {
        setLoading(true)
        const insertData: Database['public']['Tables']['tasks']['Insert'] = {
          ...task,
          user_id: user.id,
        }
        // @ts-expect-error - Supabase型推論の問題（既知の問題、src/server/api/routers/profile.ts:44参照）
        const { data, error } = await supabase.from('tasks').insert(insertData).select().single()

        if (error) throw error
        setTasks((prev) => [data, ...prev])
        return { data, error: null }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create task'
        setError(message)
        return { data: null, error: message }
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const updateTask = useCallback(async (id: string, updates: TaskUpdate) => {
    const supabase = createClient()
    try {
      setLoading(true)
      const updateData: Database['public']['Tables']['tasks']['Update'] = {
        ...updates,
      }
      // @ts-expect-error - Supabase型推論の問題（既知の問題、src/server/api/routers/profile.ts:44参照）
      const { data, error } = await supabase.from('tasks').update(updateData).eq('id', id).select().single()

      if (error) throw error
      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)))
      return { data, error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      return { data: null, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const supabase = createClient()
    try {
      setLoading(true)
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error
      setTasks((prev) => prev.filter((task) => task.id !== id))
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      setError(message)
      return { error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  }
}
