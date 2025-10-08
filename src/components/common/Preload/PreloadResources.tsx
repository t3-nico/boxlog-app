'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

/**
 * 重要なリソースをプリロードし、ナビゲーションを高速化
 */
export const PreloadResources = () => {
  const router = useRouter()

  useEffect(() => {
    // 重要なページをプリフェッチ
    const criticalRoutes = ['/calendar', '/board', '/table', '/settings']

    // 少し遅延してからプリフェッチ（初期ロードを妨げないため）
    const timer = setTimeout(() => {
      criticalRoutes.forEach((route) => {
        router.prefetch(route)
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  useEffect(() => {
    // WebFont のプリロード
    const fontLinks = ['https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap']

    fontLinks.forEach((href) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      document.head.appendChild(link)
    })
  }, [])

  return null
}

/**
 * Service Workerを使用したキャッシュ戦略
 */
export function initializeCacheStrategy() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}
