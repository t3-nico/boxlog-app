"use client"

import { useRouter } from 'next/navigation'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'


export default function PasswordClient() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) {
      router.push('/calender')
    }
  }, [user, router])

  return (
    <ForgotPasswordForm onLoginClick={() => router.push('/auth/login')} />
  )
}
