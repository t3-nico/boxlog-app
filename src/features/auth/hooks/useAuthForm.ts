/**
 * 認証フォーム用の共通カスタムフック
 *
 * email、password、loading、errorの状態管理を共通化
 */

import { useState } from 'react'

interface UseAuthFormOptions {
  initialEmail?: string
  initialPassword?: string
}

export function useAuthForm(options: UseAuthFormOptions = {}) {
  const [email, setEmail] = useState(options.initialEmail || '')
  const [password, setPassword] = useState(options.initialPassword || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const setErrorMessage = (message: string | null) => {
    setError(message)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 8
  }

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('メールアドレスを入力してください')
      return false
    }

    if (!validateEmail(email)) {
      setError('有効なメールアドレスを入力してください')
      return false
    }

    if (!password.trim()) {
      setError('パスワードを入力してください')
      return false
    }

    if (!validatePassword(password)) {
      setError('パスワードは8文字以上である必要があります')
      return false
    }

    return true
  }

  return {
    // State values
    email,
    password,
    loading,
    error,

    // Setters
    setEmail,
    setPassword,
    setLoading,
    setError: setErrorMessage,

    // Utilities
    resetForm,
    clearError,
    validateForm,
    validateEmail,
    validatePassword,

    // Computed values
    isValid: email.trim() !== '' && password.trim() !== '' && validateEmail(email) && validatePassword(password),
  }
}
