'use client'

import { useEffect, useState, useCallback } from 'react'

export interface ServiceWorkerState {
  /** Service Workerがサポートされているか */
  isSupported: boolean
  /** 登録済みか */
  isRegistered: boolean
  /** 更新が利用可能か */
  updateAvailable: boolean
  /** 登録中か */
  isRegistering: boolean
  /** エラー */
  error: Error | null
}

export interface UseServiceWorkerResult extends ServiceWorkerState {
  /** 手動で更新を適用 */
  applyUpdate: () => void
  /** キャッシュをクリア */
  clearCache: () => Promise<void>
}

/**
 * Service Worker を管理するフック
 *
 * @example
 * ```tsx
 * const { isRegistered, updateAvailable, applyUpdate } = useServiceWorker()
 *
 * if (updateAvailable) {
 *   return <button onClick={applyUpdate}>アップデートを適用</button>
 * }
 * ```
 */
export function useServiceWorker(): UseServiceWorkerResult {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    updateAvailable: false,
    isRegistering: false,
    error: null,
  })

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Service Worker 登録
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    setState((prev) => ({ ...prev, isSupported: true, isRegistering: true }))

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        setRegistration(reg)
        setState((prev) => ({
          ...prev,
          isRegistered: true,
          isRegistering: false,
        }))

        // 更新チェック
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState((prev) => ({ ...prev, updateAvailable: true }))
            }
          })
        })

        // 定期的に更新チェック（1時間ごと）
        setInterval(
          () => {
            reg.update()
          },
          60 * 60 * 1000
        )
      } catch (error) {
        console.error('[SW] Registration failed:', error)
        setState((prev) => ({
          ...prev,
          isRegistering: false,
          error: error instanceof Error ? error : new Error('Registration failed'),
        }))
      }
    }

    // ページ読み込み完了後に登録
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
      return () => window.removeEventListener('load', registerSW)
    }
  }, [])

  // 更新適用
  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return

    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }, [registration])

  // キャッシュクリア
  const clearCache = useCallback(async () => {
    if (!registration?.active) return

    registration.active.postMessage({ type: 'CLEAR_CACHE' })

    // 追加でブラウザキャッシュもクリア
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.filter((name) => name.startsWith('boxlog-')).map((name) => caches.delete(name)))
    }
  }, [registration])

  return {
    ...state,
    applyUpdate,
    clearCache,
  }
}
