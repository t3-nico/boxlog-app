// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * Supabase 認証フック
 * @description React hooks for Supabase authentication
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import type { AuthError, Session, User } from '@supabase/supabase-js'

import { supabase } from './client'

/**
 * 認証状態を管理するフック
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setError(error)
      setLoading(false)
    })

    // 認証状態変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // メール・パスワードでサインイン
  const signInWithEmail = useCallback(async (email: string, password: string) => {
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
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setError(error)
    setLoading(false)
    return { error }
  }, [])

  // パスワードリセット
  const resetPassword = useCallback(async (email: string) => {
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
    setLoading(true)
    const { data, error } = await supabase.auth.updateUser({
      password,
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
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}

/**
 * プロフィール情報を管理するフック
 */
interface Profile {
  id: string
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) return

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
    async (updates: Partial<Profile>) => {
      if (!user) return

      try {
        setLoading(true)
        const { error } = await supabase.from('profiles').upsert({ id: user.id, ...updates })

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
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!user) return

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
    async (task: any) => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ ...task, user_id: user.id }])
          .select()
          .single()

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

  const updateTask = useCallback(async (id: string, updates: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()

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
