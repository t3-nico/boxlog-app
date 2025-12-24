'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuthStore } from '../stores/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
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
          <div className="border-foreground mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
