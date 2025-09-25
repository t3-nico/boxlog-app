/**
 * 🚨 BoxLog統一エラークラス
 *
 * アプリケーション全体で統一されたエラーハンドリングを提供
 * ログ分析・監視の効率化とデバッグの高速化を実現
 */

import {
  ErrorCategory,
  ErrorCode,
  ErrorLevel,
  getErrorCategory,
  getErrorCodeName,
  getErrorSeverity,
} from '@/constants/errorCodes'

/**
 * エラーコンテキスト情報の型定義
 */
export interface ErrorContext {
  /** ユーザーID（該当する場合） */
  userId?: string | number
  /** リクエストID（トレーシング用） */
  requestId?: string
  /** セッションID */
  sessionId?: string
  /** 追加のメタデータ */
  metadata?: Record<string, unknown>
  /** スタックトレース（開発環境用） */
  stack?: string
  /** 発生したURL */
  url?: string
  /** HTTPメソッド */
  method?: string
  /** User-Agent */
  userAgent?: string
}

/**
 * エラーログレベル
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * BoxLog統一エラークラス
 *
 * 全てのアプリケーションエラーはこのクラスを使用して処理される
 * 統一されたエラーコード体系とログ出力により効率的なデバッグを支援
 */
export class AppError extends Error {
  /** エラーコード（1000-7999の範囲で分野別に分類） */
  public readonly code: ErrorCode

  /** エラーカテゴリ（auth, api, data, ui, system, business, external） */
  public readonly category: ErrorCategory

  /** エラーレベル（info, warning, error, critical） */
  public readonly level: ErrorLevel

  /** エラー発生時刻 */
  public readonly timestamp: Date

  /** 追加コンテキスト情報 */
  public readonly context: ErrorContext

  /** 復旧可能かどうか */
  public readonly recoverable: boolean

  /** 内部エラー（原因となったエラー） */
  public readonly cause?: Error

  /** ユーザー向けメッセージ（多言語対応） */
  public readonly userMessage?: string

  /** 開発者向け詳細情報 */
  public readonly details?: unknown

  constructor(
    message: string,
    code: ErrorCode,
    options: {
      cause?: Error
      context?: ErrorContext
      recoverable?: boolean
      userMessage?: string
      details?: unknown
    } = {}
  ) {
    super(message)

    // エラー名を設定
    this.name = 'AppError'

    // 基本情報の設定
    this.code = code
    this.category = getErrorCategory(code)
    this.level = getErrorSeverity(code)
    this.timestamp = new Date()

    // オプション情報の設定
    this.cause = options.cause
    this.context = options.context || {}
    this.recoverable = options.recoverable ?? this.isRecoverableByDefault()
    this.userMessage = options.userMessage
    this.details = options.details

    // スタックトレースを設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * デフォルトの復旧可能性を判定
   */
  private isRecoverableByDefault(): boolean {
    switch (this.category) {
      case 'auth':
        return true // 認証エラーは通常再ログインで復旧可能
      case 'api':
        return true // APIエラーは通常リトライで復旧可能
      case 'data':
        return false // データエラーは通常復旧困難
      case 'ui':
        return true // UIエラーは通常リロードで復旧可能
      case 'system':
        return false // システムエラーは通常復旧困難
      case 'business':
        return false // ビジネスロジックエラーは通常復旧困難
      case 'external':
        return true // 外部サービスエラーは通常リトライで復旧可能
      default:
        return false
    }
  }

  /**
   * ログ出力用のオブジェクトを生成
   */
  public toLogObject(): Record<string, unknown> {
    return {
      // 基本情報
      error: true,
      name: this.name,
      message: this.message,
      code: this.code,
      codeName: getErrorCodeName(this.code),
      category: this.category,
      level: this.level,
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,

      // 詳細情報
      userMessage: this.userMessage,
      details: this.details,
      stack: this.stack,

      // コンテキスト情報
      context: this.context,

      // 原因エラー情報
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    }
  }

  /**
   * JSON文字列として出力
   */
  public toJSON(): string {
    return JSON.stringify(this.toLogObject(), null, 2)
  }

  /**
   * コンソール表示用の文字列を生成
   */
  public toString(): string {
    return `[${this.category.toUpperCase()}:${this.code}] ${this.message}`
  }

  /**
   * ユーザー向けの安全なエラー情報を取得
   */
  public toUserSafeObject(): Record<string, unknown> {
    return {
      code: this.code,
      category: this.category,
      message: this.userMessage || 'エラーが発生しました',
      timestamp: this.timestamp.toISOString(),
      recoverable: this.recoverable,
    }
  }

  /**
   * HTTP レスポンス用の情報を生成
   */
  public toHttpResponse(): {
    status: number
    body: Record<string, unknown>
  } {
    // カテゴリ別のHTTPステータスコードマッピング
    const statusCode = this.getHttpStatusCode()

    return {
      status: statusCode,
      body: {
        error: {
          code: this.code,
          message: this.userMessage || 'An error occurred',
          category: this.category,
          timestamp: this.timestamp.toISOString(),
          recoverable: this.recoverable,
          // 開発環境でのみ詳細を含める
          ...(process.env.NODE_ENV === 'development' && {
            details: this.details,
            stack: this.stack,
          }),
        },
      },
    }
  }

  /**
   * エラーカテゴリに基づいてHTTPステータスコードを決定
   */
  private getHttpStatusCode(): number {
    switch (this.category) {
      case 'auth':
        return this.code === 1003 ? 403 : 401 // AUTH_NO_PERMISSION は403、その他は401
      case 'api':
        if (this.code === 2001) return 429 // API_RATE_LIMIT
        if (this.code === 2002) return 400 // API_INVALID_PARAM
        if (this.code === 2004) return 408 // API_TIMEOUT
        return 500
      case 'data':
        if (this.code === 3001) return 404 // DATA_NOT_FOUND
        if (this.code === 3002) return 409 // DATA_DUPLICATE
        if (this.code === 3003) return 400 // DATA_VALIDATION_ERROR
        return 500
      case 'ui':
        return 400
      case 'system':
        return 500
      case 'business':
        return 422 // Unprocessable Entity
      case 'external':
        return 502 // Bad Gateway
      default:
        return 500
    }
  }

  /**
   * エラーの重要度に基づいてアラートが必要かを判定
   */
  public shouldAlert(): boolean {
    return this.level === 'error' || this.level === 'critical'
  }

  /**
   * エラー発生からの経過時間（ミリ秒）を取得
   */
  public getElapsedTime(): number {
    return Date.now() - this.timestamp.getTime()
  }

  /**
   * 同じエラーコードの別のエラーと比較
   */
  public isSameType(other: AppError): boolean {
    return this.code === other.code && this.category === other.category
  }
}

/**
 * 統一エラーファクトリ関数
 */
export class ErrorFactory {
  /**
   * 認証エラーを作成
   */
  static createAuthError(message: string, code: ErrorCode, context?: ErrorContext): AppError {
    return new AppError(message, code, {
      context,
      userMessage: '認証に失敗しました。再度ログインしてください。',
    })
  }

  /**
   * APIエラーを作成
   */
  static createApiError(message: string, code: ErrorCode, cause?: Error, context?: ErrorContext): AppError {
    return new AppError(message, code, {
      cause,
      context,
      userMessage: 'サーバーとの通信でエラーが発生しました。',
    })
  }

  /**
   * データエラーを作成
   */
  static createDataError(message: string, code: ErrorCode, details?: unknown, context?: ErrorContext): AppError {
    return new AppError(message, code, {
      details,
      context,
      userMessage: 'データの処理でエラーが発生しました。',
    })
  }

  /**
   * 既存のErrorからAppErrorに変換
   */
  static fromError(error: Error, code: ErrorCode, context?: ErrorContext): AppError {
    return new AppError(error.message, code, {
      cause: error,
      context: {
        ...context,
        stack: error.stack,
      },
    })
  }

  /**
   * HTTPレスポンスからエラーを作成
   */
  static fromHttpResponse(response: { status: number; statusText: string }, context?: ErrorContext): AppError {
    const code = response.status === 401 ? 1001 : 2007 // AUTH_INVALID_TOKEN or API_HTTP_ERROR
    return new AppError(`HTTP ${response.status}: ${response.statusText}`, code, {
      context: {
        ...context,
        httpStatus: response.status,
        httpStatusText: response.statusText,
      },
    })
  }
}

export default AppError
