"use client"

import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/auth/RegisterForm'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
}

export default function Login() {
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user) {
      router.push('/calender')
    }
  }, [user, router])

  return (
    <RegisterForm onLoginClick={() => router.push('/auth/login')} />
  )
}
