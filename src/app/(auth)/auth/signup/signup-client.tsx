"use client"

import { useRouter } from 'next/navigation'
import RegisterForm from '@/components/auth/RegisterForm'
import { useAuthContext } from '@/contexts/AuthContext'
import { useEffect } from 'react'


export default function SignupClient() {
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
