/**
 * 開発者ツール統合フック
 * パフォーマンス監視、エラーハンドリング、デバッグ機能を統合
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { handleClientError } from '@/lib/errors'

// === 型定義 ===

interface PerformanceMetrics {
  renderCount: number
  renderTime: number
  memoryUsage: number
  lastRender: number
}

interface ErrorInfo {
  error: Error
  errorInfo?: any
  timestamp: number
  component?: string
}

interface DevToolsConfig {
  enablePerformanceMonitoring?: boolean
  enableErrorBoundary?: boolean
  enableMemoryMonitoring?: boolean
  enableRenderTracking?: boolean
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'
}

// === メインフック ===

export function useDevTools(componentName?: string, config: DevToolsConfig = {}) {
  const {
    enablePerformanceMonitoring = process.env.NODE_ENV === 'development',
    enableErrorBoundary = true,
    enableMemoryMonitoring = process.env.NODE_ENV === 'development',
    enableRenderTracking = process.env.NODE_ENV === 'development',
    logLevel = process.env.NODE_ENV === 'development' ? 'info' : 'error'
  } = config

  // パフォーマンス監視
  const performanceMetrics = usePerformanceMonitor(componentName, enablePerformanceMonitoring)
  
  // エラーハンドリング
  const errorHandler = useErrorHandler(componentName, enableErrorBoundary)
  
  // メモリ監視
  const memoryStats = useMemoryMonitor(enableMemoryMonitoring)
  
  // レンダー追跡
  const renderStats = useRenderTracker(componentName, enableRenderTracking)

  // ログ出力
  const log = useCallback((level: string, message: string, data?: any) => {
    const levels = ['none', 'error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(logLevel)
    const messageLevelIndex = levels.indexOf(level)

    if (messageLevelIndex <= currentLevelIndex && messageLevelIndex > 0) {
      const prefix = componentName ? `[${componentName}]` : '[DevTools]'
      console[level as keyof Console](`${prefix} ${message}`, data || '')
    }
  }, [componentName, logLevel])

  return {
    // パフォーマンス
    performanceMetrics,
    
    // エラーハンドリング
    reportError: errorHandler.reportError,
    clearErrors: errorHandler.clearErrors,
    errors: errorHandler.errors,
    
    // メモリ
    memoryStats,
    
    // レンダー
    renderStats,
    
    // ユーティリティ
    log,
    isDevMode: process.env.NODE_ENV === 'development',
  }
}

// === サブフック ===

/**
 * パフォーマンス監視フック
 */
function usePerformanceMonitor(componentName?: string, enabled = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    renderTime: 0,
    memoryUsage: 0,
    lastRender: 0
  })
  
  const renderStartRef = useRef<number>(0)
  const renderCountRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    renderStartRef.current = performance.now()
    renderCountRef.current += 1

    const renderEnd = performance.now()
    const renderTime = renderEnd - renderStartRef.current

    setMetrics(prev => ({
      ...prev,
      renderCount: renderCountRef.current,
      renderTime,
      lastRender: renderEnd
    }))

    // パフォーマンス警告
    if (renderTime > 16) { // 60fps threshold
      console.warn(`[${componentName || 'Component'}] Slow render: ${renderTime.toFixed(2)}ms`)
    }
  })

  return metrics
}

/**
 * エラーハンドリングフック
 */
function useErrorHandler(componentName?: string, enabled = true) {
  const [errors, setErrors] = useState<ErrorInfo[]>([])

  const reportError = useCallback((error: Error, errorInfo?: any) => {
    if (!enabled) return

    const errorData: ErrorInfo = {
      error,
      errorInfo,
      timestamp: Date.now(),
      component: componentName
    }

    setErrors(prev => [...prev, errorData])

    // エラーをコンソールに出力
    console.error(`[${componentName || 'Component'}] Error:`, error, errorInfo)

    // 開発環境では詳細情報も出力
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Details')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component:', componentName)
      console.error('Timestamp:', new Date(errorData.timestamp))
      console.groupEnd()
    }
  }, [componentName, enabled])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // エラーバウンダリーの設定
  useEffect(() => {
    if (!enabled) return

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(new Error(event.reason), { type: 'unhandledRejection' })
    }

    const handleError = (event: ErrorEvent) => {
      reportError(event.error, { type: 'uncaughtError' })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [enabled, reportError])

  return { reportError, clearErrors, errors }
}

/**
 * メモリ監視フック
 */
function useMemoryMonitor(enabled = true) {
  const [memoryStats, setMemoryStats] = useState<{
    used: number
    total: number
    percentage: number
    timestamp: number
  }>({
    used: 0,
    total: 0,
    percentage: 0,
    timestamp: 0
  })

  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const updateMemoryStats = () => {
      const memory = (performance as any).memory
      if (!memory) return

      const stats = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        timestamp: Date.now()
      }

      setMemoryStats(stats)

      // メモリ警告
      if (stats.percentage > 90) {
        console.warn('High memory usage detected:', `${stats.percentage.toFixed(1)}%`)
      }
    }

    updateMemoryStats()
    const interval = setInterval(updateMemoryStats, 5000) // 5秒間隔

    return () => clearInterval(interval)
  }, [enabled])

  return memoryStats
}

/**
 * レンダー追跡フック
 */
function useRenderTracker(componentName?: string, enabled = true) {
  const renderCountRef = useRef(0)
  const propsRef = useRef<any>({})
  const [renderHistory, setRenderHistory] = useState<Array<{
    count: number
    timestamp: number
    propsChanged: string[]
  }>>([])

  useEffect(() => {
    if (!enabled) return

    renderCountRef.current += 1
    const timestamp = Date.now()

    // Props変更検出（開発環境のみ）
    let propsChanged: string[] = []
    if (process.env.NODE_ENV === 'development') {
      // 実際のprops比較は実装時に追加
      propsChanged = []
    }

    setRenderHistory(prev => [
      ...prev.slice(-9), // 最新10件を保持
      {
        count: renderCountRef.current,
        timestamp,
        propsChanged
      }
    ])

    // 過度なレンダーを警告
    if (renderCountRef.current > 50) {
      console.warn(`[${componentName || 'Component'}] Many re-renders detected: ${renderCountRef.current}`)
    }
  })

  return {
    renderCount: renderCountRef.current,
    renderHistory
  }
}

// === ユーティリティフック ===

/**
 * プロファイリング用フック
 */
export function useProfiler(name: string, enabled = process.env.NODE_ENV === 'development') {
  const startProfile = useCallback(() => {
    if (!enabled) return

    if ('mark' in performance) {
      performance.mark(`${name}-start`)
    }
  }, [name, enabled])

  const endProfile = useCallback(() => {
    if (!enabled) return

    if ('mark' in performance && 'measure' in performance) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      
      const entries = performance.getEntriesByName(name)
      const latest = entries[entries.length - 1]
      if (latest) {
        console.log(`[Profile] ${name}: ${latest.duration?.toFixed(2)}ms`)
      }
    }
  }, [name, enabled])

  return { startProfile, endProfile }
}

/**
 * デバッグ情報表示フック
 */
export function useDebugInfo(data: any, label?: string, enabled = process.env.NODE_ENV === 'development') {
  useEffect(() => {
    if (!enabled) return

    console.group(`[Debug] ${label || 'Data'}`)
    console.log('Current value:', data)
    console.log('Type:', typeof data)
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()
  }, [data, label, enabled])
}

// === React DevTools統合 ===

/**
 * React DevToolsとの統合
 */
export function useReactDevTools(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // React DevToolsが利用可能かチェック
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      // DevTools用の追加情報を設定
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (...args) => {
        // コミット情報のログ出力など
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[${componentName}] React DevTools: Fiber root committed`)
        }
      }
    }
  }, [componentName, enabled])
}