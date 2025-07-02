'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  // 認証済みユーザーは自動的にリダイレクト
  useEffect(() => {
    if (!loading && user) {
      router.push('/calendar')
    }
  }, [user, loading, router])

  return <LoginForm />
}
