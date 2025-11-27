/**
 * エラーハンドラーライブラリ
 * 統一エラー処理・自動復旧・ユーザー通知の中央管理システム
 */

// 値のインポート
import {
  AppError,
  createAppError,
  ERROR_CODES,
  errorPatternDictionary,
  executeWithAutoRecovery,
  getErrorCategory,
} from '@/config/error-patterns/index'

// 型のインポート
import type { ErrorCode, ErrorHandlingResult, ErrorMetadata } from '@/config/error-patterns/index'

/**
 * エラーハンドリングオプション
 */
export interface ErrorHandlingOptions {
  showUserNotification?: boolean // ユーザー通知を表示するか
  logLevel?: 'debug' | 'info' | 'warn' | 'error' // ログレベル
  context?: Record<string, unknown> // 追加コンテキスト
  userId?: string // ユーザーID
  sessionId?: string // セッションID
  requestId?: string // リクエストID
  source?: string // エラー発生源
  retryEnabled?: boolean // リトライを有効にするか
  fallbackEnabled?: boolean // フォールバックを有効にするか
}

/**
 * ユーザー通知の設定
 */
export interface NotificationConfig {
  type: 'toast' | 'modal' | 'banner' | 'console' // 通知タイプ
  duration?: number // 表示時間（ミリ秒）
  persistent?: boolean // 永続表示するか
  actionButton?: {
    // アクションボタン
    text: string
    action: () => void
  }
}

/**
 * メインエラーハンドラークラス
 */
export class ErrorHandler {
  private notificationHandlers = new Map<string, (message: string, config: NotificationConfig) => void>()
  private logHandlers = new Map<string, (level: string, message: string, error?: AppError) => void>()

  /**
   * 通知ハンドラーを登録
   */
  registerNotificationHandler(type: string, handler: (message: string, config: NotificationConfig) => void): void {
    this.notificationHandlers.set(type, handler)
  }

  /**
   * ログハンドラーを登録
   */
  registerLogHandler(type: string, handler: (level: string, message: string, error?: AppError) => void): void {
    this.logHandlers.set(type, handler)
  }

  /**
   * エラーを処理する（メイン関数）
   */
  async handleError(error: Error | AppError, errorCode?: ErrorCode, options: ErrorHandlingOptions = {}): Promise<void> {
    const appError = this.normalizeError(error, errorCode, options)

    // ログ出力
    this.logError(appError, options.logLevel || appError.pattern.recovery.logLevel)

    // ユーザー通知
    if (options.showUserNotification !== false && appError.shouldNotifyUser()) {
      await this.notifyUser(appError, options)
    }

    // Sentry連携（別途実装）
    await this.reportToSentry(appError)

    // 統計更新
    this.updateErrorMetrics(appError)
  }

  /**
   * 自動復旧付きでエラーを処理
   */
  async handleWithRecovery<T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    options: ErrorHandlingOptions = {}
  ): Promise<ErrorHandlingResult<T>> {
    try {
      const result = await executeWithAutoRecovery(operation, errorCode, options.context)

      // 成功時のログ
      if (result.success && (result.recoveryApplied || result.fallbackUsed)) {
        this.logRecoverySuccess(errorCode, result, options)
      }

      return result
    } catch (error) {
      // 復旧失敗時の処理
      const appError = this.normalizeError(error as Error, errorCode, options)
      await this.handleError(appError, undefined, options)

      return {
        success: false,
        error: appError,
        retryCount: 0,
        recoveryApplied: false,
        fallbackUsed: false,
      }
    }
  }

  /**
   * APIエラーを処理
   */
  async handleApiError(response: Response, options: ErrorHandlingOptions = {}): Promise<AppError> {
    let errorCode: ErrorCode

    // HTTPステータスコードからエラーコードを推定
    switch (response.status) {
      case 401:
        errorCode = ERROR_CODES.INVALID_TOKEN
        break
      case 403:
        errorCode = ERROR_CODES.NO_PERMISSION
        break
      case 404:
        errorCode = ERROR_CODES.NOT_FOUND
        break
      case 422:
        errorCode = ERROR_CODES.INVALID_FORMAT
        break
      case 429:
        errorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED
        break
      case 500:
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR
        break
      case 502:
      case 503:
        errorCode = ERROR_CODES.SERVICE_UNAVAILABLE
        break
      case 504:
        errorCode = ERROR_CODES.API_TIMEOUT
        break
      default:
        errorCode = ERROR_CODES.UNEXPECTED_ERROR
    }

    const errorMessage = `API Error: ${response.status} ${response.statusText}`
    const metadata: Partial<ErrorMetadata> = {
      source: 'api',
      context: {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      },
      ...options,
    }

    const appError = createAppError(errorMessage, errorCode, metadata)
    await this.handleError(appError, undefined, options)

    return appError
  }

  /**
   * バリデーションエラーを処理
   */
  async handleValidationError(
    fieldErrors: Record<string, string>,
    options: ErrorHandlingOptions = {}
  ): Promise<AppError> {
    const errorCode = ERROR_CODES.REQUIRED_FIELD
    const errorMessage = 'Validation failed'
    const metadata: Partial<ErrorMetadata> = {
      source: 'validation',
      context: { fieldErrors },
      ...options,
    }

    const appError = createAppError(errorMessage, errorCode, metadata)
    await this.handleError(appError, undefined, {
      ...options,
      showUserNotification: true,
    })

    return appError
  }

  /**
   * データベースエラーを処理
   */
  async handleDatabaseError(error: Error, operation: string, _options: ErrorHandlingOptions = {}): Promise<AppError> {
    let errorCode: ErrorCode

    // エラーメッセージからコードを推定
    if (error.message.includes('connection')) {
      errorCode = ERROR_CODES.CONNECTION_FAILED
    } else if (error.message.includes('timeout')) {
      errorCode = ERROR_CODES.QUERY_TIMEOUT
    } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
      errorCode = ERROR_CODES.DUPLICATE_KEY
    } else if (error.message.includes('foreign key')) {
      errorCode = ERROR_CODES.FOREIGN_KEY_VIOLATION
    } else if (error.message.includes('not found')) {
      errorCode = ERROR_CODES.NOT_FOUND
    } else {
      errorCode = ERROR_CODES.UNEXPECTED_ERROR
    }

    const metadata: Partial<ErrorMetadata> = {
      source: 'database',
      context: {
        operation,
        originalError: error.message,
        stack: error.stack,
      },
      ..._options,
    }

    const appError = createAppError(error.message, errorCode, metadata)
    await this.handleError(appError, undefined, _options)

    return appError
  }

  /**
   * 外部サービスエラーを処理
   */
  async handleExternalServiceError(
    serviceName: string,
    error: Error,
    options: ErrorHandlingOptions = {}
  ): Promise<AppError> {
    let errorCode: ErrorCode

    if (error.message.includes('timeout')) {
      errorCode = ERROR_CODES.API_TIMEOUT
    } else if (error.message.includes('auth')) {
      errorCode = ERROR_CODES.EXTERNAL_AUTH_FAILED
    } else if (error.message.includes('unavailable')) {
      errorCode = ERROR_CODES.API_UNAVAILABLE
    } else {
      errorCode = ERROR_CODES.THIRD_PARTY_ERROR
    }

    const metadata: Partial<ErrorMetadata> = {
      source: `external:${serviceName}`,
      context: {
        serviceName,
        originalError: error.message,
      },
      ...options,
    }

    const appError = createAppError(error.message, errorCode, metadata)
    await this.handleError(appError, undefined, options)

    return appError
  }

  /**
   * エラーを正規化（AppErrorに変換）
   */
  private normalizeError(error: Error | AppError, errorCode?: ErrorCode, options: ErrorHandlingOptions = {}): AppError {
    if (error instanceof AppError) {
      return error
    }

    const finalErrorCode = errorCode || ERROR_CODES.UNEXPECTED_ERROR
    const metadata: Partial<ErrorMetadata> = {
      source: options.source || 'unknown',
      context: options.context,
      userId: options.userId,
      sessionId: options.sessionId,
      requestId: options.requestId,
    }

    return createAppError(error.message, finalErrorCode, metadata)
  }

  /**
   * エラーをログ出力
   */
  private logError(error: AppError, level: string): void {
    const message = `[${error.category}:${error.code}] ${error.message}`

    // 登録されたログハンドラーを実行
    this.logHandlers.forEach((handler) => {
      try {
        handler(level, message, error)
      } catch (handlerError) {
        console.error('Log handler failed:', handlerError)
      }
    })

    // デフォルトのコンソールログ
    switch (level) {
      case 'error':
        console.error(message, error)
        break
      case 'warn':
        console.warn(message, error)
        break
      case 'info':
        console.info(message, error)
        break
      case 'debug':
      default:
        console.debug(message, error)
    }
  }

  /**
   * ユーザーに通知
   */
  private async notifyUser(error: AppError, options: ErrorHandlingOptions): Promise<void> {
    const config: NotificationConfig = {
      type: 'toast',
      duration: error.severity === 'critical' ? 0 : 5000,
      persistent: error.severity === 'critical',
    }

    // ユーザーメッセージを取得
    const userMsg = error.userMessage
    const message = userMsg ? `${userMsg.title}${userMsg.description ? `: ${userMsg.description}` : ''}` : error.message

    // 登録された通知ハンドラーを実行
    this.notificationHandlers.forEach((handler) => {
      try {
        handler(message, config)
      } catch (handlerError) {
        console.error('Notification handler failed:', handlerError)
      }
    })
  }

  /**
   * 復旧成功をログ出力
   */
  private logRecoverySuccess(errorCode: ErrorCode, result: ErrorHandlingResult, options: ErrorHandlingOptions): void {
    const category = getErrorCategory(errorCode)
    const message = `Recovery successful for ${category}:${errorCode}`

    const details = {
      retryCount: result.retryCount,
      recoveryApplied: result.recoveryApplied,
      fallbackUsed: result.fallbackUsed,
      executionTime: result.executionTime,
    }

    console.info(message, details)
  }

  /**
   * Sentryにレポート（後で実装）
   */
  private async reportToSentry(_error: AppError): Promise<void> {
    // Sentry連携は別途実装
    // const sentryContext = error.getSentryContext()
    // Sentry.captureException(error, sentryContext)
  }

  /**
   * エラーメトリクスを更新
   */
  private updateErrorMetrics(_error: AppError): void {
    // メトリクス更新処理
    // 実装側でカスタムメトリクス収集システムと連携
  }

  /**
   * 健全性チェック
   */
  getHealthStatus() {
    return errorPatternDictionary.healthCheck()
  }

  /**
   * エラー統計を取得
   */
  getErrorStats() {
    return {
      errors: errorPatternDictionary.getErrorStats(),
      categories: errorPatternDictionary.getCategoryStats(),
      circuitBreakers: errorPatternDictionary.getCircuitBreakerStatus(),
    }
  }
}

/**
 * グローバルエラーハンドラーインスタンス
 */
export const globalErrorHandler = new ErrorHandler()

/**
 * 便利なヘルパー関数
 */

/**
 * 簡単なエラー処理
 */
export async function handleError(
  error: Error | AppError,
  errorCode?: ErrorCode,
  options?: ErrorHandlingOptions
): Promise<void> {
  return globalErrorHandler.handleError(error, errorCode, options)
}

/**
 * 自動復旧付きエラー処理
 */
export async function handleWithRecovery<T>(
  operation: () => Promise<T>,
  errorCode: ErrorCode,
  options?: ErrorHandlingOptions
): Promise<ErrorHandlingResult<T>> {
  return globalErrorHandler.handleWithRecovery(operation, errorCode, options)
}

/**
 * APIエラー処理
 */
export async function handleApiError(response: Response, options?: ErrorHandlingOptions): Promise<AppError> {
  return globalErrorHandler.handleApiError(response, options)
}

/**
 * バリデーションエラー処理
 */
export async function handleValidationError(
  fieldErrors: Record<string, string>,
  options?: ErrorHandlingOptions
): Promise<AppError> {
  return globalErrorHandler.handleValidationError(fieldErrors, options)
}

/**
 * データベースエラー処理
 */
export async function handleDatabaseError(
  error: Error,
  operation: string,
  options?: ErrorHandlingOptions
): Promise<AppError> {
  return globalErrorHandler.handleDatabaseError(error, operation, options)
}

/**
 * 外部サービスエラー処理
 */
export async function handleExternalServiceError(
  serviceName: string,
  error: Error,
  options?: ErrorHandlingOptions
): Promise<AppError> {
  return globalErrorHandler.handleExternalServiceError(serviceName, error, options)
}

/**
 * 通知ハンドラー登録
 */
export function registerNotificationHandler(
  type: string,
  handler: (message: string, config: NotificationConfig) => void
): void {
  globalErrorHandler.registerNotificationHandler(type, handler)
}

/**
 * ログハンドラー登録
 */
export function registerLogHandler(
  type: string,
  handler: (level: string, message: string, error?: AppError) => void
): void {
  globalErrorHandler.registerLogHandler(type, handler)
}

/**
 * エラー統計取得
 */
export function getErrorStats() {
  return globalErrorHandler.getErrorStats()
}

/**
 * 健全性チェック
 */
export function getHealthStatus() {
  return globalErrorHandler.getHealthStatus()
}
