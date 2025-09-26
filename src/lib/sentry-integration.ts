/**
 * Sentry統合エラーハンドリングシステム
 * 既存のエラー体系とSentryを連携させる
 */

import * as Sentry from '@sentry/nextjs'

import { AppError } from './errors'

// エラーレベルの定義
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
}

// エラーカテゴリ（BoxLogの統一エラーコード体系と連携）
export enum ErrorCategory {
  AUTH = 'authentication', // 1000番台
  API = 'api', // 2000番台
  DATA = 'database', // 3000番台
  UI = 'frontend', // 4000番台
  SYSTEM = 'infrastructure', // 5000番台
  BUSINESS = 'business_logic', // 6000番台
  EXTERNAL = 'external_service', // 7000番台
}

// エラーコード → カテゴリ・重要度マッピング
const ERROR_MAPPING: Record<string, { category: ErrorCategory; severity: ErrorSeverity; priority: number }> = {
  // 1000番台: 認証・セキュリティ系
  AUTH_INVALID_TOKEN: { category: ErrorCategory.AUTH, severity: ErrorSeverity.ERROR, priority: 1 },
  AUTH_EXPIRED: { category: ErrorCategory.AUTH, severity: ErrorSeverity.WARNING, priority: 2 },
  AUTH_NO_PERMISSION: { category: ErrorCategory.AUTH, severity: ErrorSeverity.ERROR, priority: 1 },
  UNAUTHORIZED: { category: ErrorCategory.AUTH, severity: ErrorSeverity.ERROR, priority: 1 },
  FORBIDDEN: { category: ErrorCategory.AUTH, severity: ErrorSeverity.ERROR, priority: 1 },

  // 2000番台: API・ネットワーク系
  API_RATE_LIMIT: { category: ErrorCategory.API, severity: ErrorSeverity.WARNING, priority: 2 },
  API_INVALID_PARAM: { category: ErrorCategory.API, severity: ErrorSeverity.ERROR, priority: 2 },
  API_TIMEOUT: { category: ErrorCategory.API, severity: ErrorSeverity.WARNING, priority: 3 },

  // 3000番台: データ・データベース系
  DATA_NOT_FOUND: { category: ErrorCategory.DATA, severity: ErrorSeverity.INFO, priority: 4 },
  DATA_DUPLICATE: { category: ErrorCategory.DATA, severity: ErrorSeverity.WARNING, priority: 3 },
  DATA_VALIDATION_ERROR: { category: ErrorCategory.DATA, severity: ErrorSeverity.ERROR, priority: 2 },
  NOT_FOUND: { category: ErrorCategory.DATA, severity: ErrorSeverity.INFO, priority: 4 },
  VALIDATION_ERROR: { category: ErrorCategory.DATA, severity: ErrorSeverity.WARNING, priority: 3 },
  SUPABASE_ERROR: { category: ErrorCategory.DATA, severity: ErrorSeverity.ERROR, priority: 2 },

  // デフォルト
  UNKNOWN_ERROR: { category: ErrorCategory.SYSTEM, severity: ErrorSeverity.FATAL, priority: 1 },
}

/**
 * エラー自動分類・優先度付けシステム
 */
export class SentryErrorHandler {
  /**
   * AppErrorをSentryに送信（自動分類・優先度付き）
   */
  static captureAppError(error: AppError, context?: Record<string, unknown>): void {
    const mapping = ERROR_MAPPING[error.code] || ERROR_MAPPING['UNKNOWN_ERROR']

    Sentry.withScope((scope) => {
      // カテゴリ・優先度設定
      scope.setTag('error_category', mapping.category)
      scope.setTag('error_code', error.code)
      scope.setTag('priority', mapping.priority)
      scope.setLevel(mapping.severity as Sentry.SeverityLevel)

      // 追加コンテキスト
      if (context) {
        scope.setContext('error_context', context)
      }

      if (error.details) {
        scope.setContext('error_details', error.details as Record<string, unknown>)
      }

      // フィンガープリント設定（同種エラーのグルーピング用）
      scope.setFingerprint([error.code, mapping.category])

      Sentry.captureException(error)
    })
  }

  /**
   * 汎用エラーをSentryに送信（自動判定）
   */
  static captureError(error: unknown, context?: Record<string, unknown>): void {
    if (error instanceof AppError) {
      this.captureAppError(error, context)
      return
    }

    // Error インスタンスの場合
    if (error instanceof Error) {
      Sentry.withScope((scope) => {
        scope.setTag('error_category', ErrorCategory.SYSTEM)
        scope.setTag('error_code', 'UNKNOWN_ERROR')
        scope.setTag('priority', 1)
        scope.setLevel(ErrorSeverity.ERROR as Sentry.SeverityLevel)

        if (context) {
          scope.setContext('error_context', context)
        }

        scope.setFingerprint(['UNKNOWN_ERROR', ErrorCategory.SYSTEM])
        Sentry.captureException(error)
      })
      return
    }

    // 文字列やその他の値の場合
    Sentry.withScope((scope) => {
      scope.setTag('error_category', ErrorCategory.SYSTEM)
      scope.setTag('error_code', 'UNKNOWN_ERROR')
      scope.setTag('priority', 1)
      scope.setLevel(ErrorSeverity.ERROR as Sentry.SeverityLevel)

      if (context) {
        scope.setContext('error_context', context)
      }

      scope.setFingerprint(['UNKNOWN_ERROR', ErrorCategory.SYSTEM])
      Sentry.captureMessage(`Unknown error: ${JSON.stringify(error)}`, ErrorSeverity.ERROR as Sentry.SeverityLevel)
    })
  }

  /**
   * ユーザーセッション記録用の情報設定
   */
  static setUserContext(user: { id: string; email?: string; username?: string; [key: string]: unknown }): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      ...user,
    })
  }

  /**
   * 操作コンテキストの記録（どの画面・操作でエラーが発生したか）
   */
  static setOperationContext(operation: {
    page: string
    action: string
    feature: string
    [key: string]: unknown
  }): void {
    Sentry.setTag('page', operation.page)
    Sentry.setTag('action', operation.action)
    Sentry.setTag('feature', operation.feature)

    Sentry.setContext('operation', operation)
  }

  /**
   * パフォーマンス監視用のスパン開始（新しいAPI）
   */
  static startSpan<T>(name: string, operation: string = 'navigation', fn: () => T): T {
    return Sentry.startSpan(
      {
        name,
        op: operation,
      },
      fn
    )
  }

  /**
   * パンくずリスト記録（ユーザーの行動フロー）
   */
  static addBreadcrumb(message: string, category: string = 'ui', level: Sentry.SeverityLevel = 'info'): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
    })
  }
}

/**
 * React Error Boundary用のSentryエラーハンドラー
 */
export function handleReactError(error: Error, errorInfo?: { componentStack?: string }): void {
  Sentry.withScope((scope) => {
    scope.setTag('error_category', ErrorCategory.UI)
    scope.setTag('error_code', 'REACT_ERROR')
    scope.setTag('priority', 2)
    scope.setLevel(ErrorSeverity.ERROR as Sentry.SeverityLevel)

    if (errorInfo?.componentStack) {
      scope.setContext('react_error_info', {
        componentStack: errorInfo.componentStack,
      })
    }

    scope.setFingerprint(['REACT_ERROR', ErrorCategory.UI])
    Sentry.captureException(error)
  })
}

/**
 * Next.js API Route用のSentryエラーハンドラー
 */
export function handleApiError(
  error: unknown,
  req?: { method?: string; url?: string; headers?: Record<string, string> }
): void {
  Sentry.withScope((scope) => {
    scope.setTag('error_category', ErrorCategory.API)
    scope.setLevel(ErrorSeverity.ERROR as Sentry.SeverityLevel)

    if (req) {
      scope.setContext('request_info', {
        method: req.method,
        url: req.url,
        userAgent: req.headers?.['user-agent'],
        referer: req.headers?.['referer'],
      })
    }

    if (error instanceof AppError) {
      SentryErrorHandler.captureAppError(error)
    } else {
      SentryErrorHandler.captureError(error)
    }
  })
}

/**
 * 便利な関数：エラーをキャッチしてSentryに送信
 */
export function withSentryErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args)

      // Promise の場合は catch も追加
      if (result && typeof result === 'object' && 'catch' in result) {
        ;(result as Promise<unknown>).catch((error: unknown) => {
          SentryErrorHandler.captureError(error, context)
          throw error
        })
      }

      return result
    } catch (error) {
      SentryErrorHandler.captureError(error, context)
      throw error
    }
  }) as T
}
