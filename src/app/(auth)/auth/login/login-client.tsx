"use client"

import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'


export default function LoginClient() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) {
      router.push('/calender')
    }
  }, [user, router])

  return (
    <LoginForm
      onRegisterClick={() => router.push('/auth/signup')}
      onForgotPasswordClick={() => router.push('/auth/password')}
    />
  )
}
