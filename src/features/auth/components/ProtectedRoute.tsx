'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { border, colors } from '@/config/theme'

import { useAuthContext } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className={`h-12 w-12 animate-spin rounded-full border-b-2 ${border.universal} mx-auto`}></div>
          <p className={`mt-4 ${colors.text.muted}`}>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
