/**
 * セキュアエラーハンドリング
 *
 * 本番環境で内部情報を漏洩させないエラー処理
 * @see Issue #487 - OWASP準拠のセキュリティ強化 Phase 2
 */

import { AppError } from '@/config/error-patterns'

/**
 * サニタイズされたエラーレスポンス
 */
export interface SecureErrorResponse {
  message: string
  code?: string
  statusCode?: number
  timestamp?: string
}

/**
 * 本番環境で除外すべき情報
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /database/i,
  /connection/i,
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // IPアドレス
  /\/[a-zA-Z0-9_\-\/]+\.ts/, // ファイルパス
  /at\s+[a-zA-Z0-9_\.]+\s+\(/, // スタックトレース
]

/**
 * エラーメッセージに機密情報が含まれているかチェック
 */
function containsSensitiveInfo(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message))
}

/**
 * エラーメッセージをサニタイズ
 */
export function sanitizeError(error: unknown): SecureErrorResponse {
  const isProd = process.env.NODE_ENV === 'production'

  // AppErrorの場合
  if (error instanceof AppError) {
    return {
      message: isProd ? getGenericMessage(error.code) : error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
    }
  }

  // 標準Errorの場合
  if (error instanceof Error) {
    // 本番環境: 機密情報チェック
    if (isProd) {
      return {
        message: containsSensitiveInfo(error.message)
          ? 'An error occurred. Please try again.'
          : error.message,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      }
    }

    // 開発環境: 詳細情報を返す
    return {
      message: error.message,
      code: error.name,
      timestamp: new Date().toISOString(),
    }
  }

  // 不明なエラー
  return {
    message: isProd ? 'An unexpected error occurred.' : String(error),
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString(),
  }
}

/**
 * エラーコードに基づくユーザーフレンドリーなメッセージ
 */
function getGenericMessage(code?: string): string {
  const messages: Record<string, string> = {
    AUTH_ERROR: 'Authentication failed. Please log in again.',
    VALIDATION_ERROR: 'Invalid input. Please check your data.',
    NOT_FOUND: 'The requested resource was not found.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    DATABASE_ERROR: 'A database error occurred. Please try again.',
    NETWORK_ERROR: 'A network error occurred. Please check your connection.',
    TIMEOUT: 'The request timed out. Please try again.',
  }

  return messages[code || ''] || 'An error occurred. Please try again.'
}

/**
 * スタックトレースを除去
 */
export function removeStackTrace(error: Error): Error {
  const sanitized = new Error(error.message)
  sanitized.name = error.name

  // スタックトレースを除去
  delete sanitized.stack

  return sanitized
}

/**
 * データベースエラーを抽象化
 */
export function sanitizeDatabaseError(error: unknown): SecureErrorResponse {
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    // 本番環境: 具体的なエラーを隠す
    return {
      message: 'A database error occurred. Please try again.',
      code: 'DATABASE_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    }
  }

  // 開発環境: 詳細を返す
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
    }
  }

  return {
    message: String(error),
    code: 'DATABASE_ERROR',
    timestamp: new Date().toISOString(),
  }
}

/**
 * ファイルパスを除去
 */
export function removeFilePaths(message: string): string {
  // Unix-style path
  const unixPath = /\/[a-zA-Z0-9_\-\/\.]+\.(ts|js|tsx|jsx)/g
  // Windows-style path
  const windowsPath = /[A-Z]:\\[a-zA-Z0-9_\-\\\.]+\.(ts|js|tsx|jsx)/g

  return message.replace(unixPath, '[FILE]').replace(windowsPath, '[FILE]')
}

/**
 * 内部実装詳細を隠蔽
 */
export function hideInternalDetails(error: Error): string {
  let message = error.message

  // スタックトレース削除
  message = message.split('\n')[0] || message

  // ファイルパス削除
  message = removeFilePaths(message)

  // 内部変数名の削除
  message = message.replace(/\b[a-z][a-zA-Z0-9_]*\b\s*=/, '[VARIABLE] =')

  return message
}

/**
 * エラーログを安全に記録
 *
 * 本番環境では機密情報を除外してログ出力
 */
export function logSecureError(error: unknown, context?: Record<string, unknown>) {
  const isProd = process.env.NODE_ENV === 'production'
  const sanitized = sanitizeError(error)

  if (isProd) {
    // 本番環境: サニタイズされたエラーのみ
    console.error('[Error]', {
      message: sanitized.message,
      code: sanitized.code,
      timestamp: sanitized.timestamp,
      // contextから機密情報を除外
      context: context ? sanitizeContext(context) : undefined,
    })
  } else {
    // 開発環境: 完全なエラー情報
    console.error('[Error]', {
      error,
      context,
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}

/**
 * コンテキスト情報から機密データを除外
 */
function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'auth', 'cookie']

  for (const [key, value] of Object.entries(context)) {
    // 機密キーは除外
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
      continue
    }

    // オブジェクトは再帰的にサニタイズ
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * APIレスポンス用のエラーフォーマット
 */
export function formatErrorResponse(error: unknown): {
  error: SecureErrorResponse
} {
  return {
    error: sanitizeError(error),
  }
}
