'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
}

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const { user, loading } = useAuthContext()
  const router = useRouter()

  const handleRegisterClick = () => setMode('register')
  const handleLoginClick = () => setMode('login')
  const handleForgotPasswordClick = () => setMode('forgot-password')

  // 認証済みユーザーは自動的にリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.push('/calender')
    }
  }, [user, loading, router])

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // 認証済みユーザーは何も表示しない（リダイレクト中）
  if (user) {
    return null
  }

  return (
    <>
      {mode === 'login' && (
        <LoginForm
          onRegisterClick={handleRegisterClick}
          onForgotPasswordClick={handleForgotPasswordClick}
        />
      )}
      {mode === 'register' && (
        <RegisterForm onLoginClick={handleLoginClick} />
      )}
      {mode === 'forgot-password' && (
        <ForgotPasswordForm onLoginClick={handleLoginClick} />
      )}
    </>
  )
}
