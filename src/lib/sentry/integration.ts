// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * Sentry連携システム
 * エラーパターン辞書との統合による自動分類・構造化レポーティング
 */

import * as Sentry from '@sentry/nextjs'

import { AppError, type ErrorCategory, type SeverityLevel } from '@/config/error-patterns'

/**
 * Sentry設定オプション
 */
export interface SentryIntegrationOptions {
  dsn?: string
  environment?: string
  release?: string
  sampleRate?: number
  tracesSampleRate?: number
  enableAutoSessionTracking?: boolean
  enableUserContext?: boolean
  enablePerformanceMonitoring?: boolean
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null
}

/**
 * カテゴリ別Sentryタグ設定
 */
const CATEGORY_TAGS: Record<ErrorCategory, Record<string, string>> = {
  AUTH: {
    domain: 'authentication',
    priority: 'high',
    team: 'security',
    alerting: 'immediate',
  },
  VALIDATION: {
    domain: 'user-input',
    priority: 'medium',
    team: 'frontend',
    alerting: 'batch',
  },
  DB: {
    domain: 'database',
    priority: 'critical',
    team: 'backend',
    alerting: 'immediate',
  },
  BIZ: {
    domain: 'business-logic',
    priority: 'medium',
    team: 'product',
    alerting: 'daily',
  },
  EXTERNAL: {
    domain: 'third-party',
    priority: 'medium',
    team: 'integration',
    alerting: 'hourly',
  },
  SYSTEM: {
    domain: 'infrastructure',
    priority: 'critical',
    team: 'devops',
    alerting: 'immediate',
  },
  RATE: {
    domain: 'rate-limiting',
    priority: 'low',
    team: 'backend',
    alerting: 'daily',
  },
}

/**
 * Sentry統合クラス
 */
export class SentryIntegration {
  private initialized = false
  private options: SentryIntegrationOptions

  constructor(options: SentryIntegrationOptions = {}) {
    this.options = {
      environment: process.env.NODE_ENV || 'development',
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      enableAutoSessionTracking: true,
      enableUserContext: true,
      enablePerformanceMonitoring: true,
      ...options,
    }
  }

  initialize(): void {
    if (this.initialized) {
      return
    }

    Sentry.init({
      dsn: this.options.dsn || process.env.SENTRY_DSN,
      environment: this.options.environment,
      release: this.options.release || process.env.NEXT_PUBLIC_APP_VERSION,
      sampleRate: this.options.sampleRate,
      tracesSampleRate: this.options.tracesSampleRate,
      autoSessionTracking: this.options.enableAutoSessionTracking,

      beforeSend: (event, hint) => {
        const filteredEvent = this.filterEvent(event, hint)
        if (this.options.beforeSend && filteredEvent) {
          return this.options.beforeSend(filteredEvent)
        }
        return filteredEvent
      },
    })

    this.initialized = true
    console.log('Sentry integration initialized')
  }

  reportError(error: AppError): void {
    if (!this.initialized) {
      this.initialize()
    }

    Sentry.withScope((scope) => {
      scope.setTag('errorCode', error.code)
      scope.setTag('errorCategory', error.category)
      scope.setTag('severity', error.severity)

      const categoryTags = CATEGORY_TAGS[error.category]
      Object.entries(categoryTags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })

      scope.setFingerprint(this.generateFingerprint(error))
      scope.setLevel(this.mapSeverityToSentryLevel(error.severity))

      scope.setContext('errorPattern', {
        code: error.code,
        category: error.category,
        severity: error.severity,
        userMessage: error.userMessage,
      })

      if (error.metadata) {
        scope.setContext('errorMetadata', error.metadata)
      }

      if (this.options.enableUserContext && error.metadata.userId) {
        scope.setUser({
          id: error.metadata.userId,
          ip_address: error.metadata.ip,
          userAgent: error.metadata.userAgent,
        })
      }

      Sentry.captureException(error)
    })
  }

  private filterEvent(event: Sentry.Event, hint?: Sentry.EventHint): Sentry.Event | null {
    if (this.options.environment === 'development') {
      const ignoredMessages = ['Non-Error promise rejection captured', 'Network Error', 'ChunkLoadError']

      if (ignoredMessages.some((msg) => event.message?.includes(msg))) {
        return null
      }
    }

    return event
  }

  private generateFingerprint(error: AppError): string[] {
    return ['boxlog-app', error.category, error.code.toString()]
  }

  private mapSeverityToSentryLevel(severity: SeverityLevel): Sentry.SeverityLevel {
    switch (severity) {
      case 'critical':
        return 'fatal'
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'error'
    }
  }

  isHealthy(): boolean {
    return this.initialized && !!Sentry.getClient()
  }
}

export const sentryIntegration = new SentryIntegration()

export function initializeSentry(options?: SentryIntegrationOptions): void {
  if (options) {
    sentryIntegration.constructor(options)
  }
  sentryIntegration.initialize()
}

export function reportToSentry(error: AppError): void {
  sentryIntegration.reportError(error)
}

// エラーハンドラーエクスポート
export class SentryErrorHandler {
  static handleError(error: Error | AppError, context?: Record<string, any>): void {
    if (error instanceof AppError) {
      sentryIntegration.reportError(error)
    } else {
      const appError = new AppError(error.message, 'SYSTEM_ERROR_500', { originalError: error, ...context })
      sentryIntegration.reportError(appError)
    }
  }

  static setOperationContext(context: Record<string, any>): void {
    Sentry.setContext('operation', context)
  }

  static addBreadcrumb(breadcrumb: {
    message: string
    category?: string
    level?: Sentry.SeverityLevel
    data?: Record<string, any>
  }): void {
    Sentry.addBreadcrumb(breadcrumb)
  }
}

export function handleReactError(error: Error, errorInfo?: any): void {
  SentryErrorHandler.handleError(error, { errorInfo, type: 'react' })
}

export function handleApiError(error: Error, context?: Record<string, any>): void {
  SentryErrorHandler.handleError(error, { ...context, type: 'api' })
}

if (typeof window !== 'undefined') {
  sentryIntegration.initialize()
}
