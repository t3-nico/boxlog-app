'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onRegisterClick={() => setMode('register')}
            onForgotPasswordClick={() => setMode('forgot-password')}
          />
        )
      case 'register':
        return <RegisterForm onLoginClick={() => setMode('login')} />
      case 'forgot-password':
        return <ForgotPasswordForm onLoginClick={() => setMode('login')} />
      default:
        return (
          <LoginForm
            onRegisterClick={() => setMode('register')}
            onForgotPasswordClick={() => setMode('forgot-password')}
          />
        )
    }
  }

  return <div className="flex w-full justify-center">{renderForm()}</div>
}
