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
    console.error('Auth error:', error)
    if (!error) return null
    const errorMessages: Record<string, string> = {
      'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません',
      'auth/user-disabled': 'ユーザーが無効になっています',
      'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
      'auth/weak-password': 'パスワードは6文字以上で入力してください',
      'auth/popup-closed-by-user': '認証ウィンドウが閉じられました',
      'auth/popup-blocked': 'ポップアップがブロックされました',
      'auth/unauthorized-domain': 'このドメインは認証に使用できません',
    }
    return errorMessages[error.code] || error.message
  }, [])

  useEffect(() => {
    console.log('Initializing Firebase...')
    initFirebase()
    const auth = getAuth()
    console.log('Firebase Auth initialized:', auth)
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user')
      setAuthState({ user, loading: false, error: null })
    })
    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string) => {
    console.log('Attempting sign up for:', email)
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await createUserWithEmailAndPassword(getAuth(), email, password)
      console.log('Sign up successful:', result.user.email)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email)
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await signInWithEmailAndPassword(getAuth(), email, password)
      console.log('Sign in successful:', result.user.email)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    console.log('Attempting OAuth sign in with:', provider)
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const auth = getAuth()
      const prov = provider === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com')
      console.log('OAuth provider created:', prov)
      const result = await signInWithPopup(auth, prov)
      console.log('OAuth sign in successful:', result.user.email)
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      console.error('OAuth sign in error:', error)
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const signOut = async () => {
    console.log('Attempting sign out')
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await firebaseSignOut(getAuth())
      console.log('Sign out successful')
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', email)
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const result = await sendPasswordResetEmail(getAuth(), email)
      console.log('Password reset email sent')
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      console.error('Password reset error:', error)
      const errorMessage = handleAuthError(error)
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return { data: null, error: errorMessage }
    }
  }

  const updatePassword = async (password: string) => {
    console.log('Attempting password update')
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      if (!getAuth().currentUser) throw new Error('No user')
      const result = await firebaseUpdatePassword(getAuth().currentUser!, password)
      console.log('Password update successful')
      setAuthState((prev) => ({ ...prev, loading: false }))
      return { data: result, error: null }
    } catch (error: any) {
      console.error('Password update error:', error)
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
