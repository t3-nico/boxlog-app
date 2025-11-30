/**
 * エラーパターン辞書システム - メイン辞書
 * 統一エラー管理・自動復旧システムのコアエンジン
 */

import {
  type ErrorCategory,
  type ErrorCode,
  type SeverityLevel,
  CATEGORY_RETRYABLE,
  CATEGORY_SEVERITY,
  ERROR_CATEGORIES,
  ERROR_CODES,
  getErrorCategory,
} from './categories'

import { type UserMessage, getUserMessage, SEVERITY_STYLES } from './messages'

import {
  type CircuitBreakerConfig,
  type CircuitBreakerMetrics,
  type FallbackStrategy,
  type RecoveryStrategy,
  type RetryStrategy,
  CircuitBreaker,
  executeWithFallback,
  executeWithRetry,
  getRecoveryStrategy,
} from './recovery-strategies'

// Re-export from categories
export {
  CATEGORY_RETRYABLE,
  CATEGORY_SEVERITY,
  ERROR_CATEGORIES,
  ERROR_CODES,
  getErrorCategory,
  type ErrorCategory,
  type ErrorCode,
  type SeverityLevel,
}

// Re-export from messages
export { getUserMessage, SEVERITY_STYLES, type UserMessage }

// Re-export from recovery-strategies
export {
  CircuitBreaker,
  executeWithFallback,
  executeWithRetry,
  getRecoveryStrategy,
  type CircuitBreakerConfig,
  type CircuitBreakerMetrics,
  type FallbackStrategy,
  type RecoveryStrategy,
  type RetryStrategy,
}

/**
 * エラーパターン辞書の完全な定義
 */
export interface ErrorPattern {
  code: ErrorCode // エラーコード
  category: ErrorCategory // カテゴリ
  severity: SeverityLevel // 重要度
  message: UserMessage // ユーザー向けメッセージ
  recovery: RecoveryStrategy // 復旧戦略
  metadata: ErrorMetadata // メタデータ
}

/**
 * エラーメタデータ
 */
export interface ErrorMetadata {
  source: string // エラー発生源（API、DB、外部サービス等）
  timestamp: Date // 発生日時
  context?: Record<string, any> | undefined // コンテキスト情報
  userId?: string | undefined // ユーザーID（該当する場合）
  sessionId?: string | undefined // セッションID
  requestId?: string | undefined // リクエストID
  userAgent?: string | undefined // ユーザーエージェント
  ip?: string | undefined // IPアドレス
  version?: string | undefined // アプリケーションバージョン
}

/**
 * 処理結果の型定義
 */
export interface ErrorHandlingResult<T = any> {
  success: boolean // 処理成功フラグ
  data?: T // 成功時のデータ
  error?: AppError // エラー情報
  retryCount?: number // リトライ回数
  recoveryApplied?: boolean // 復旧処理が適用されたか
  fallbackUsed?: boolean // フォールバックが使用されたか
  executionTime?: number // 実行時間（ミリ秒）
}

/**
 * 統一エラークラス
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly category: ErrorCategory
  public readonly severity: SeverityLevel
  public readonly userMessage: UserMessage
  public readonly metadata: ErrorMetadata
  public readonly pattern: ErrorPattern
  public readonly cause?: Error

  constructor(message: string, code: ErrorCode, metadata: Partial<ErrorMetadata> = {}, cause?: Error) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.category = getErrorCategory(code)
    this.severity = CATEGORY_SEVERITY[this.category]
    this.userMessage = getUserMessage(code)
    this.metadata = {
      source: 'unknown',
      timestamp: new Date(),
      ...metadata,
    }
    this.pattern = this.buildPattern()

    // 元のエラーを保持
    if (cause) {
      this.cause = cause
      if (cause.stack) {
        this.stack = cause.stack
      }
    }

    // スタックトレースのキャプチャ
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  private buildPattern(): ErrorPattern {
    return {
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.userMessage,
      recovery: getRecoveryStrategy(this.code),
      metadata: this.metadata,
    }
  }

  /**
   * JSON形式でシリアライズ
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      userMessage: this.userMessage,
      metadata: this.metadata,
      stack: this.stack,
    }
  }

  /**
   * Sentry用の追加コンテキスト
   */
  getSentryContext() {
    return {
      tags: {
        errorCode: this.code,
        errorCategory: this.category,
        severity: this.severity,
      },
      extra: {
        userMessage: this.userMessage,
        metadata: this.metadata,
        pattern: this.pattern,
      },
      level:
        this.severity === 'critical'
          ? 'error'
          : this.severity === 'high'
            ? 'warning'
            : this.severity === 'medium'
              ? 'info'
              : 'debug',
    }
  }

  /**
   * 自動リトライ可能かどうか
   */
  isRetryable(): boolean {
    return CATEGORY_RETRYABLE[this.category] && this.pattern.recovery.retry.enabled
  }

  /**
   * ユーザー通知が必要かどうか
   */
  shouldNotifyUser(): boolean {
    return this.pattern.recovery.userNotification
  }
}

/**
 * エラーパターン辞書のメインクラス
 */
export class ErrorPatternDictionary {
  private circuitBreakers = new Map<string, CircuitBreaker>()
  private errorStats = new Map<ErrorCode, number>()

  /**
   * エラーパターンを取得
   */
  getPattern(errorCode: ErrorCode): ErrorPattern {
    const category = getErrorCategory(errorCode)
    const severity = CATEGORY_SEVERITY[category]
    const message = getUserMessage(errorCode)
    const recovery = getRecoveryStrategy(errorCode)

    return {
      code: errorCode,
      category,
      severity,
      message,
      recovery,
      metadata: {
        source: 'dictionary',
        timestamp: new Date(),
      },
    }
  }

  /**
   * AppErrorを作成
   */
  createError(message: string, code: ErrorCode, metadata?: Partial<ErrorMetadata>, cause?: Error): AppError {
    // 統計情報更新
    this.updateStats(code)

    return new AppError(message, code, metadata, cause)
  }

  /**
   * 既存のエラーをAppErrorに変換
   */
  wrapError(error: Error, code: ErrorCode, metadata?: Partial<ErrorMetadata>): AppError {
    return this.createError(error.message, code, metadata, error)
  }

  /**
   * 自動復旧付きで操作を実行
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    context?: Record<string, any>
  ): Promise<ErrorHandlingResult<T>> {
    const startTime = Date.now()
    const pattern = this.getPattern(errorCode)
    let retryCount = 0
    let fallbackUsed = false
    let recoveryApplied = false

    try {
      // サーキットブレーカーを取得または作成
      const circuitBreaker = this.getCircuitBreaker(errorCode, pattern.recovery.circuitBreaker)

      // リトライ戦略での実行
      let result: T
      if (pattern.recovery.retry.enabled) {
        result = await executeWithRetry(() => circuitBreaker.execute(operation), pattern.recovery.retry, errorCode)
        recoveryApplied = true
        retryCount = pattern.recovery.retry.maxAttempts
      } else {
        result = await circuitBreaker.execute(operation)
      }

      return {
        success: true,
        data: result,
        retryCount,
        recoveryApplied,
        fallbackUsed,
        executionTime: Date.now() - startTime,
      }
    } catch (error) {
      // フォールバック実行
      if (pattern.recovery.fallback?.enabled) {
        try {
          const fallbackResult = await executeWithFallback(operation, pattern.recovery.fallback)
          fallbackUsed = true

          return {
            success: true,
            data: fallbackResult,
            retryCount,
            recoveryApplied,
            fallbackUsed,
            executionTime: Date.now() - startTime,
          }
        } catch (fallbackError) {
          // フォールバックも失敗
        }
      }

      // AppErrorとして返す
      const appError =
        error instanceof AppError ? error : this.wrapError(error as Error, errorCode, context ? { context } : undefined)

      return {
        success: false,
        error: appError,
        retryCount,
        recoveryApplied,
        fallbackUsed,
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * サーキットブレーカーを取得または作成
   */
  private getCircuitBreaker(errorCode: ErrorCode, config: CircuitBreakerConfig): CircuitBreaker {
    const key = `${errorCode}`

    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker(config))
    }

    return this.circuitBreakers.get(key)!
  }

  /**
   * エラー統計を更新
   */
  private updateStats(errorCode: ErrorCode): void {
    const current = this.errorStats.get(errorCode) || 0
    this.errorStats.set(errorCode, current + 1)
  }

  /**
   * エラー統計を取得
   */
  getErrorStats(): Map<ErrorCode, number> {
    return new Map(this.errorStats)
  }

  /**
   * 統計情報をリセット
   */
  resetStats(): void {
    this.errorStats.clear()
  }

  /**
   * カテゴリ別統計を取得
   */
  getCategoryStats(): Record<ErrorCategory, number> {
    // 全カテゴリを0で初期化
    const categoryStats = Object.fromEntries(
      Object.values(ERROR_CATEGORIES).map((category) => [category, 0])
    ) as Record<ErrorCategory, number>

    // 集計
    this.errorStats.forEach((count, errorCode) => {
      const category = getErrorCategory(errorCode)
      categoryStats[category] += count
    })

    return categoryStats
  }

  /**
   * サーキットブレーカーの状態を取得
   */
  getCircuitBreakerStatus(): Record<string, CircuitBreakerMetrics> {
    const status: Record<string, CircuitBreakerMetrics> = {}

    this.circuitBreakers.forEach((breaker, key) => {
      status[key] = breaker.getMetrics()
    })

    return status
  }

  /**
   * 健全性チェック
   */
  healthCheck(): {
    totalErrors: number
    categoryBreakdown: Record<ErrorCategory, number>
    circuitBreakers: Record<string, any>
    criticalErrors: number
  } {
    const categoryStats = this.getCategoryStats()
    const totalErrors = Array.from(this.errorStats.values()).reduce((sum, count) => sum + count, 0)
    const criticalErrors = Array.from(this.errorStats.entries())
      .filter(([code]) => CATEGORY_SEVERITY[getErrorCategory(code)] === 'critical')
      .reduce((sum, [, count]) => sum + count, 0)

    return {
      totalErrors,
      categoryBreakdown: categoryStats,
      circuitBreakers: this.getCircuitBreakerStatus(),
      criticalErrors,
    }
  }
}

/**
 * グローバルエラーパターン辞書インスタンス
 */
export const errorPatternDictionary = new ErrorPatternDictionary()

/**
 * 便利なヘルパー関数
 */
export function createAppError(
  message: string,
  code: ErrorCode,
  metadata?: Partial<ErrorMetadata>,
  cause?: Error
): AppError {
  return errorPatternDictionary.createError(message, code, metadata, cause)
}

export function wrapError(error: Error, code: ErrorCode, metadata?: Partial<ErrorMetadata>): AppError {
  return errorPatternDictionary.wrapError(error, code, metadata)
}

export async function executeWithAutoRecovery<T>(
  operation: () => Promise<T>,
  errorCode: ErrorCode,
  context?: Record<string, any>
): Promise<ErrorHandlingResult<T>> {
  return errorPatternDictionary.executeWithRecovery(operation, errorCode, context)
}
