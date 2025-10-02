// @ts-nocheck TODO(#389): 型エラー1件を段階的に修正する
/**
 * 🚨 BoxLog統一エラーハンドリングシステム
 *
 * アプリケーション全体で統一されたエラー処理を提供
 * ログ出力・ユーザー通知・監視アラートを自動化
 */

import { ERROR_CODES } from '@/constants/errorCodes'

import { AppError, ErrorFactory } from './AppError'

/**
 * ログ出力関数の型定義
 */
type LogFunction = (message: string, data?: Record<string, unknown>) => void

/**
 * ログレベル別の出力関数
 */
interface Logger {
  debug: LogFunction
  info: LogFunction
  warn: LogFunction
  error: LogFunction
  fatal: LogFunction
}

/**
 * エラーハンドリング設定
 */
interface ErrorHandlerConfig {
  /** ログ出力を有効にするか */
  enableLogging: boolean
  /** コンソール出力を有効にするか */
  enableConsoleOutput: boolean
  /** 外部監視サービスへの送信を有効にするか */
  enableExternalReporting: boolean
  /** 開発環境でのスタックトレース表示 */
  showStackTrace: boolean
  /** ユーザー通知を有効にするか */
  enableUserNotification: boolean
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableLogging: true,
  enableConsoleOutput: process.env.NODE_ENV === 'development',
  enableExternalReporting: process.env.NODE_ENV === 'production',
  showStackTrace: process.env.NODE_ENV === 'development',
  enableUserNotification: true,
}

/**
 * 簡易ログ出力（外部ライブラリ未使用時）
 */
const DEFAULT_LOGGER: Logger = {
  debug: (message, data) => console.debug(`[DEBUG] ${message}`, data || ''),
  info: (message, data) => console.info(`[INFO] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || ''),
  fatal: (message, data) => console.error(`[FATAL] ${message}`, data || ''),
}

/**
 * 統一エラーハンドラクラス
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig
  private logger: Logger

  constructor(config: Partial<ErrorHandlerConfig> = {}, logger: Logger = DEFAULT_LOGGER) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.logger = logger
  }

  /**
   * エラーを処理し、適切なアクションを実行
   */
  public handleError(error: Error | AppError, context?: Record<string, unknown>): AppError {
    // AppErrorでない場合は変換
    const appError = error instanceof AppError ? error : this.convertToAppError(error, context)

    // ログ出力
    if (this.config.enableLogging) {
      this.logError(appError)
    }

    // コンソール出力
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(appError)
    }

    // 外部監視サービスへの報告
    if (this.config.enableExternalReporting && appError.shouldAlert()) {
      this.reportToExternalService(appError)
    }

    // ユーザー通知
    if (this.config.enableUserNotification) {
      this.notifyUser(appError)
    }

    return appError
  }

  /**
   * Promise拒否エラーの処理
   */
  public handlePromiseRejection(reason: unknown, context?: Record<string, unknown>): AppError {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    return this.handleError(error, context)
  }

  /**
   * 非同期エラーの処理
   */
  public handleAsyncError(error: Error, context?: Record<string, unknown>): AppError {
    // 非同期エラーは通常より重要度が高い
    const appError = this.convertToAppError(error, context, ERROR_CODES.SYSTEM_MEMORY_ERROR)
    return this.handleError(appError, context)
  }

  /**
   * APIエラーの処理
   */
  public handleApiError(
    response: { status: number; statusText: string; body?: unknown },
    context?: Record<string, unknown>
  ): AppError {
    const appError = ErrorFactory.fromHttpResponse(response, context)
    return this.handleError(appError, context)
  }

  /**
   * 認証エラーの処理
   */
  public handleAuthError(
    message: string,
    code = ERROR_CODES.AUTH_INVALID_TOKEN,
    context?: Record<string, unknown>
  ): AppError {
    const appError = ErrorFactory.createAuthError(message, code, context)
    return this.handleError(appError, context)
  }

  /**
   * データエラーの処理
   */
  public handleDataError(
    message: string,
    code = ERROR_CODES.DATA_NOT_FOUND,
    details?: unknown,
    context?: Record<string, unknown>
  ): AppError {
    const appError = ErrorFactory.createDataError(message, code, details, context)
    return this.handleError(appError, context)
  }

  /**
   * 既存のErrorをAppErrorに変換
   */
  private convertToAppError(error: Error, context?: Record<string, unknown>, defaultCode?: number): AppError {
    // エラーメッセージからコードを推測
    const code = this.inferErrorCode(error) || defaultCode || ERROR_CODES.SYSTEM_CONFIG_ERROR

    return ErrorFactory.fromError(error, code, context)
  }

  /**
   * エラーメッセージからエラーコードを推測
   */
  private inferErrorCode(error: Error): number | null {
    const message = error.message.toLowerCase()

    // 認証関連
    if (message.includes('unauthorized') || message.includes('auth')) {
      return ERROR_CODES.AUTH_INVALID_TOKEN
    }

    // API関連
    if (message.includes('timeout')) {
      return ERROR_CODES.API_TIMEOUT
    }
    if (message.includes('rate limit')) {
      return ERROR_CODES.API_RATE_LIMIT
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_CODES.API_SERVER_ERROR
    }

    // データ関連
    if (message.includes('not found') || message.includes('404')) {
      return ERROR_CODES.DATA_NOT_FOUND
    }
    if (message.includes('duplicate') || message.includes('conflict')) {
      return ERROR_CODES.DATA_DUPLICATE
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_CODES.DATA_VALIDATION_ERROR
    }

    // UI関連
    if (message.includes('render') || message.includes('component')) {
      return ERROR_CODES.UI_RENDER_ERROR
    }

    return null
  }

  /**
   * ログ出力
   */
  private logError(error: AppError): void {
    const logData = error.toLogObject()
    const logFunction = this.getLogFunction(error.level)

    logFunction(`${error.category.toUpperCase()} Error: ${error.message}`, logData)
  }

  /**
   * レベルに応じたログ関数を取得
   */
  private getLogFunction(level: string): LogFunction {
    switch (level) {
      case 'info':
        return this.logger.info
      case 'warning':
        return this.logger.warn
      case 'error':
        return this.logger.error
      case 'critical':
        return this.logger.fatal
      default:
        return this.logger.error
    }
  }

  /**
   * コンソール出力
   */
  private outputToConsole(error: AppError): void {
    console.group(`🚨 ${error.category.toUpperCase()} Error [${error.code}]`)
    console.error('Message:', error.message)
    console.error('Category:', error.category)
    console.error('Level:', error.level)
    console.error('Timestamp:', error.timestamp.toISOString())
    console.error('Recoverable:', error.recoverable)

    if (error.context && Object.keys(error.context).length > 0) {
      console.error('Context:', error.context)
    }

    if (error.details) {
      console.error('Details:', error.details)
    }

    if (this.config.showStackTrace && error.stack) {
      console.error('Stack Trace:', error.stack)
    }

    if (error.cause) {
      console.error('Caused by:', error.cause)
    }

    console.groupEnd()
  }

  /**
   * 外部監視サービスへの報告
   */
  private reportToExternalService(error: AppError): void {
    // 実際の実装では、Sentry、DataDog、CloudWatch等の監視サービスを使用
    if (typeof window !== 'undefined' && window.console) {
      console.warn('📊 External reporting would send:', error.toLogObject())
    }

    // 例: Sentryへの送信
    // Sentry.captureException(error, {
    //   tags: {
    //     errorCode: error.code,
    //     category: error.category,
    //     level: error.level,
    //   },
    //   extra: error.toLogObject(),
    // })
  }

  /**
   * ユーザー通知
   */
  private notifyUser(error: AppError): void {
    // ユーザー向けの通知は重要度が高いもののみ
    if (error.level === 'error' || error.level === 'critical') {
      // 実際の実装では、トースト通知やモーダル表示を行う
      console.log('🔔 User notification:', error.userMessage || error.message)
    }
  }

  /**
   * 設定を更新
   */
  public updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * ログ出力機能を更新
   */
  public updateLogger(logger: Logger): void {
    this.logger = logger
  }
}

/**
 * グローバルエラーハンドラのインスタンス
 */
export const globalErrorHandler = new ErrorHandler()

/**
 * グローバルエラーハンドラを設定
 */
export function setupGlobalErrorHandling(): void {
  // Unhandled Promise Rejection
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault()
      const error = globalErrorHandler.handlePromiseRejection(event.reason, {
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
      console.error('Unhandled Promise Rejection:', error)
    })

    // Uncaught Exception
    window.addEventListener('error', (event) => {
      const error = globalErrorHandler.handleError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
      console.error('Uncaught Exception:', error)
    })
  }
}

/**
 * 便利な関数エクスポート
 */
export const handleError = globalErrorHandler.handleError.bind(globalErrorHandler)
export const handleApiError = globalErrorHandler.handleApiError.bind(globalErrorHandler)
export const handleAuthError = globalErrorHandler.handleAuthError.bind(globalErrorHandler)
export const handleDataError = globalErrorHandler.handleDataError.bind(globalErrorHandler)

export default ErrorHandler
