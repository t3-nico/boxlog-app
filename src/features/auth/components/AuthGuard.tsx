'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useAuthContext } from '../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  
  // 開発時の認証スキップ
  const skipAuthInDev = process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH_IN_DEV === 'true'

  useEffect(() => {
    if (!skipAuthInDev && !loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router, skipAuthInDev])

  // 開発時の認証スキップが有効な場合はすぐにchildren を表示
  if (skipAuthInDev) {
    return <>{children}</>
  }

  // ローディング中
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!user) {
    return fallback || (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Authentication Required</p>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  // 認証済みの場合
  return <>{children}</>
}