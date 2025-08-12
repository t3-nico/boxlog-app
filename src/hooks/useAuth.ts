'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  handleClientError,
  UnauthorizedError,
  ValidationError,
  getErrorMessage 
} from '@/lib/errors'

// Local types for localStorage mode
interface User {
  id: string
  email?: string
}

interface Session {
  user: User
  access_token: string
}

interface AuthError {
  message: string
}

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

  useEffect(() => {
    // ローカル専用モード: localStorage からユーザー情報を読み込み
    const initializeLocalAuth = () => {
      try {
        const savedUser = localStorage.getItem('boxlog-user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          const session: Session = {
            user: userData,
            access_token: 'local-token'
          }
          setAuthState({
            user: userData,
            session,
            loading: false,
            error: null
          })
        } else {
          // デフォルトユーザーを作成
          const defaultUser: User = {
            id: 'local-user-' + Date.now(),
            email: 'user@localhost'
          }
          localStorage.setItem('boxlog-user', JSON.stringify(defaultUser))
          const session: Session = {
            user: defaultUser,
            access_token: 'local-token'
          }
          setAuthState({
            user: defaultUser,
            session,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: 'Failed to initialize local auth'
        })
      }
    }

    initializeLocalAuth()
  }, [])

  // ローカル専用モード用のスタブメソッド
  const signUp = async (email: string, password: string, metadata?: any) => {
    return { data: null, error: 'Sign up disabled in localStorage mode' }
  }

  const signIn = async (email: string, password: string) => {
    return { data: { user: authState.user, session: authState.session }, error: null }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    return { data: null, error: 'OAuth disabled in localStorage mode' }
  }

  const signOut = async () => {
    return { error: null }
  }

  const resetPassword = async (email: string) => {
    return { data: null, error: 'Password reset disabled in localStorage mode' }
  }

  const updatePassword = async (password: string) => {
    return { data: null, error: 'Password update disabled in localStorage mode' }
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