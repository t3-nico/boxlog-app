'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to a 404 page within the app layout
    router.replace('/404-page')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          リダイレクト中...
        </div>
      </div>
    </div>
  )
}