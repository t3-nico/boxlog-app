'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User,
} from 'firebase/auth'
import { initFirebase } from '@/lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const handleAuthError = useCallback((error: any) => {
    if (!error) return null
    const errorMessages: Record<string, string> = {
      'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません',
      'auth/user-disabled': 'ユーザーが無効になっています',
      'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
      'auth/weak-password': 'パスワードは6文字以上で入力してください',
    }
    return errorMessages[error.code] || error.message
  }, [])

  useEffect(() => {
    initFirebase()
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({ user, loading: false, error: null })
    })
    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await createUserWithEmailAndPassword(getAuth(), email, password)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await signInWithEmailAndPassword(getAuth(), email, password)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const auth = getAuth()
      const prov = provider === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com')
      const result = await signInWithPopup(auth, prov)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await firebaseSignOut(getAuth())
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await sendPasswordResetEmail(getAuth(), email)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const updatePassword = async (password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      if (!getAuth().currentUser) throw new Error('No user')
      const result = await firebaseUpdatePassword(getAuth().currentUser!, password)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }

  return {
    user: authState.user,
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
