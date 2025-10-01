/**
 * 📊 BoxLog Logger System
 *
 * 統一ログシステムのメインエクスポート
 * - 全モジュール統合・便利関数・グローバルインスタンス
 */

// Core exports
export * from './formatters'
export { createLogger, getDefaultConfig, Logger } from './logger'
export * from './outputs'
export * from './types'

// Convenience imports
import { createLogger, getDefaultConfig } from './logger'

/**
 * 🌍 グローバルロガーインスタンス
 */
export const logger = createLogger(getDefaultConfig())

/**
 * 🎯 便利な関数エクスポート（グローバルロガー使用）
 */
export const log = (level: 'error' | 'warn' | 'info' | 'debug', message: string, meta?: Record<string, unknown>) =>
  logger.log(level, message, meta)

export const error = (message: string, error?: Error | unknown, context?: Record<string, unknown>) =>
  logger.error(message, error, context)

export const warn = (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta)

export const info = (message: string, meta?: Record<string, unknown>) => logger.info(message, meta)

export const debug = (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta)

export const performance = (
  message: string,
  performance: { duration: number; memory?: number; cpu?: number },
  meta?: Record<string, unknown>
) => logger.performance(message, performance, meta)

export const security = (
  message: string,
  security: {
    eventType: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach'
    ipAddress?: string
    userAgent?: string
    threatLevel?: 'low' | 'medium' | 'high' | 'critical'
    resource?: string
  },
  meta?: Record<string, unknown>
) => logger.security(message, security, meta)

export const business = (
  message: string,
  business: {
    eventType: 'user_action' | 'transaction' | 'conversion' | 'milestone'
    value?: number
    currency?: string
    category?: string
    tags?: string[]
  },
  meta?: Record<string, unknown>
) => logger.business(message, business, meta)

export const timer = (label: string) => logger.timer(label)

export const setContext = (context: Record<string, unknown>) => logger.setContext(context)
export const clearContext = () => logger.clearContext()
export const getStats = () => logger.getStats()
export const resetStats = () => logger.resetStats()
export const flush = () => logger.flush()

/**
 * 🔧 環境設定ヘルパー
 */
export function configureLogger(environment?: string): void {
  const config = getDefaultConfig(environment)
  logger.updateConfig(config)
}

/**
 * 🎯 Request Context Helper (Next.js用)
 */
export function withRequestContext<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: {
    requestId?: string
    userId?: string
    method?: string
    url?: string
  }
): T {
  return ((...args: Parameters<T>) => {
    const originalContext = logger.getContext()

    logger.setContext({
      ...originalContext,
      requestId: context.requestId,
      userId: context.userId,
      component: `${context.method} ${context.url}`,
    })

    try {
      return fn(...args)
    } finally {
      logger.setContext(originalContext)
    }
  }) as T
}

/**
 * 🎯 Error Boundary Logger Helper
 */
export function logErrorBoundary(error: Error, errorInfo: { componentStack: string }): void {
  logger.error('React Error Boundary caught error', error, {
    component: 'ErrorBoundary',
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  })
}

/**
 * 🎯 API Route Logger Helper
 */
export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'

  logger.log(level, `${method} ${url} - ${statusCode}`, {
    component: 'api',
    method,
    url,
    statusCode,
    userId,
    performance: {
      duration,
    },
  })
}

/**
 * 🎯 Database Query Logger Helper
 */
export function logDatabaseQuery(query: string, duration: number, rowCount?: number, error?: Error): void {
  if (error) {
    logger.error('Database query failed', error, {
      component: 'database',
      query: query.substring(0, 200), // 最初の200文字のみ
      performance: { duration },
    })
  } else {
    logger.performance(
      'Database query executed',
      {
        duration,
      },
      {
        component: 'database',
        query: query.substring(0, 100),
        rowCount,
      }
    )
  }
}

/**
 * 🎯 External API Logger Helper
 */
export function logExternalApi(
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  error?: Error
): void {
  if (error) {
    logger.error(`External API ${service} failed`, error, {
      component: 'external-api',
      service,
      endpoint,
      method,
      statusCode,
      performance: { duration },
    })
  } else {
    logger.info(`External API ${service} called`, {
      component: 'external-api',
      service,
      endpoint,
      method,
      statusCode,
      performance: { duration },
    })
  }
}

/**
 * 🎯 User Action Logger Helper
 */
export function logUserAction(action: string, userId: string, details?: Record<string, unknown>): void {
  logger.business(
    `User action: ${action}`,
    {
      eventType: 'user_action',
      category: 'user_interaction',
      tags: [action],
    },
    {
      userId,
      component: 'user-action',
      ...details,
    }
  )
}

/**
 * 🔄 Middleware Logger Helper
 */
export function createLoggerMiddleware(component: string) {
  return {
    onRequest: (requestId: string, method: string, url: string, userId?: string) => {
      logger.setContext({
        requestId,
        userId,
        component: `${component}:${method}:${url}`,
      })

      logger.info(`Request started: ${method} ${url}`, {
        method,
        url,
        userId,
      })
    },

    onResponse: (statusCode: number, duration: number) => {
      logger.info(`Request completed: ${statusCode}`, {
        statusCode,
        performance: { duration },
      })

      logger.clearContext()
    },

    onError: (error: Error, statusCode: number) => {
      logger.error(`Request failed: ${statusCode}`, error, {
        statusCode,
        component: 'middleware',
      })

      logger.clearContext()
    },
  }
}

/**
 * 🎯 デフォルトエクスポート
 */
const loggerSystem = {
  logger,
  log,
  error,
  warn,
  info,
  debug,
  performance,
  security,
  business,
  timer,
  setContext,
  clearContext,
  getStats,
  resetStats,
  flush,
  configureLogger,
  withRequestContext,
  logErrorBoundary,
  logApiRequest,
  logDatabaseQuery,
  logExternalApi,
  logUserAction,
  createLoggerMiddleware,
}

export default loggerSystem
