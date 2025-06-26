'use client'

import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Button } from '@/components/button'

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return <LoginForm />
      case 'register':
        return <RegisterForm />
      case 'forgot-password':
        return <ForgotPasswordForm />
      default:
        return <LoginForm />
    }
  }

  const renderSwitchButton = () => {
    switch (mode) {
      case 'login':
        return (
          <div className="space-y-2">
            <Button
              variant="secondary"
              onClick={() => setMode('register')}
              className="text-sm w-full"
            >
              アカウントをお持ちでない方はこちら
            </Button>
            <Button
              variant="secondary"
              onClick={() => setMode('forgot-password')}
              className="text-sm w-full"
            >
              パスワードを忘れた場合
            </Button>
          </div>
        )
      case 'register':
        return (
          <Button
            variant="secondary"
            onClick={() => setMode('login')}
            className="text-sm w-full"
          >
            すでにアカウントをお持ちの方はこちら
          </Button>
        )
      case 'forgot-password':
        return (
          <Button
            variant="secondary"
            onClick={() => setMode('login')}
            className="text-sm w-full"
          >
            ログインページに戻る
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
          BoxLog
        </h1>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {renderForm()}
        
        <div className="mt-6">
          {renderSwitchButton()}
        </div>
      </div>
    </div>
  )
} 