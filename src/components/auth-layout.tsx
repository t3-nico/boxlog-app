'use client'

import type React from 'react'
import { usePathname } from 'next/navigation'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // ログインページは shadcn/ui の2カラムレイアウトを使用するため、ラップしない
  if (pathname === '/auth/login') {
    return <>{children}</>
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-2">
      <div className="w-full max-w-sm p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
        {children}
      </div>
    </main>
  )
}
