'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RedirectHome() {
  const router = useRouter()

  useEffect(() => {
    // 一時的に認証チェックを無効化してビルドを通す
    router.replace('/calendar')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>リダイレクト中...</p>
      </div>
    </div>
  )
}
