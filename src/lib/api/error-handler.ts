/**
 * API エラーハンドリング統合システム
 * tRPC・Zod・エラーパターン辞書の統合エラー処理
 */
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { ERROR_CODES, type AppError } from '@/config/error-patterns'
import { trackError } from '@/lib/analytics/vercel-analytics'
import { safeJsonStringify } from './json-utils'
/**
 * APIエラーレスポンス型
 */
export interface APIErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    path?: string[]
    userMessage?: string
    timestamp: string
    requestId?: string
  }
}
/**
 * API成功レスポンス型
 */
export interface APISuccessResponse<T = any> {
  success: true
  data: T
  timestamp: string
  requestId?: string
}
/**
 * 統一レスポンス型
 */
export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse
/**
 * Zodバリデーションエラーの日本語化
 */
export function translateZodError(error: z.ZodError): {
  message: string
  details: Array<{
    field: string
    message: string
    code: string
  }>
} {
  const fieldErrorMap: Record<string, string> = {
    // 共通フィールド
    title: 'タイトル',
    description: '説明',
    priority: '優先度',
    status: 'ステータス',
    dueDate: '期限日',
    estimatedHours: '見積時間',
    actualHours: '実績時間',
    progress: '進捗率',
    projectId: 'プロジェクトID',
    assigneeId: '担当者ID',
    parentTaskId: '親タスクID',
    tags: 'タグ',
    completed: '完了フラグ',
    // ページネーション
    page: 'ページ番号',
    limit: '取得件数',
    // 検索
    query: '検索キーワード',
    sortBy: 'ソート項目',
    sortOrder: 'ソート順序',
  }
  const errorTypeMap: Record<string, string> = {
    required_error: 'は必須項目です',
    invalid_type: 'の形式が正しくありません',
    too_small: 'が短すぎます',
    too_big: 'が長すぎます',
    invalid_string: 'の形式が正しくありません',
    invalid_date: 'の日付形式が正しくありません',
    custom: '', // カスタムメッセージをそのまま使用
  }
  const details = error.errors.map((err) => {
    const fieldPath = err.path.join('.')
    const fieldName = fieldErrorMap[fieldPath] || fieldPath
    let message = err.message
    // Zodのデフォルトメッセージを日本語化
    if (err.code !== 'custom') {
      const baseMessage = errorTypeMap[err.code] || 'に問題があります'
      switch (err.code) {
        case 'too_small':
          if (err.type === 'string') {
            message = `${fieldName}は${err.minimum}文字以上で入力してください`
          } else if (err.type === 'number') {
            message = `${fieldName}は${err.minimum}以上の値を入力してください`
          } else if (err.type === 'array') {
            message = `${fieldName}は${err.minimum}個以上選択してください`
          } else {
            message = `${fieldName}${baseMessage}`
          }
          break
        case 'too_big':
          if (err.type === 'string') {
            message = `${fieldName}は${err.maximum}文字以下で入力してください`
          } else if (err.type === 'number') {
            message = `${fieldName}は${err.maximum}以下の値を入力してください`
          } else if (err.type === 'array') {
            message = `${fieldName}は${err.maximum}個以下で選択してください`
          } else {
            message = `${fieldName}${baseMessage}`
          }
          break
        case 'invalid_type':
          if (err.expected === 'string') {
            message = `${fieldName}は文字列で入力してください`
          } else if (err.expected === 'number') {
            message = `${fieldName}は数値で入力してください`
          } else if (err.expected === 'boolean') {
            message = `${fieldName}はtrue/falseで指定してください`
          } else if (err.expected === 'date') {
            message = `${fieldName}は有効な日付を入力してください`
          } else {
            message = `${fieldName}${baseMessage}`
          }
          break
        case 'invalid_string':
          if (err.validation === 'email') {
            message = `${fieldName}は有効なメールアドレスを入力してください`
          } else if (err.validation === 'url') {
            message = `${fieldName}は有効なURLを入力してください`
          } else if (err.validation === 'regex') {
            message = `${fieldName}の形式が正しくありません`
          } else {
            message = `${fieldName}${baseMessage}`
          }
          break
        case 'invalid_enum_value':
          message = `${fieldName}は有効な選択肢から選んでください`
          break
        default:
          message = `${fieldName}${baseMessage}`
      }
    }
    return {
      field: fieldPath,
      message,
      code: err.code,
    }
  })
  const primaryError = details[0]
  const summary = details.length === 1
    ? primaryError.message
    : `入力内容に${details.length}件の問題があります`
  return {
    message: summary,
    details,
  }
}
/**
 * tRPCエラーの日本語化とユーザーフレンドリー化
 */
export function translateTRPCError(error: TRPCError): {
  userMessage: string
  technicalMessage: string
  code: string
} {
  const codeMessageMap: Record<string, string> = {
    BAD_REQUEST: '入力内容に問題があります',
    UNAUTHORIZED: 'ログインが必要です',
    FORBIDDEN: 'この操作を実行する権限がありません',
    NOT_FOUND: '指定されたデータが見つかりません',
    METHOD_NOT_SUPPORTED: 'サポートされていない操作です',
    TIMEOUT: '処理がタイムアウトしました',
    CONFLICT: '競合するデータが存在します',
    PRECONDITION_FAILED: '実行に必要な条件が満たされていません',
    PAYLOAD_TOO_LARGE: '送信データが大きすぎます',
    UNPROCESSABLE_CONTENT: '処理できない内容が含まれています',
    TOO_MANY_REQUESTS: 'リクエストが多すぎます。しばらく時間をおいて再試行してください',
    CLIENT_CLOSED_REQUEST: 'リクエストがキャンセルされました',
    INTERNAL_SERVER_ERROR: 'サーバーエラーが発生しました',
  }
  const userMessage = codeMessageMap[error.code] || 'エラーが発生しました'
  // Zodバリデーションエラーが含まれている場合の特別処理
  if (error.cause && typeof error.cause === 'object' && 'issues' in error.cause) {
    const zodError = error.cause as z.ZodError
    const translated = translateZodError(zodError)
    return {
      userMessage: translated.message,
      technicalMessage: error.message,
      code: error.code,
    }
  }
  return {
    userMessage,
    technicalMessage: error.message,
    code: error.code,
  }
}
/**
 * 統一エラーハンドラー
 */
export class APIErrorHandler {
  /**
   * エラーを統一形式に変換
   */
  static handleError(
    error: unknown,
    context?: {
      operation?: string
      userId?: string
      requestId?: string
    }
  ): APIErrorResponse {
    const timestamp = new Date().toISOString()
    const requestId = context?.requestId || crypto.randomUUID()
    // TRPCエラーの処理
    if (error instanceof TRPCError) {
      const translated = translateTRPCError(error)
      // Analytics追跡
      trackError({
        errorCode: this.mapTRPCCodeToNumber(error.code),
        errorCategory: 'API',
        severity: this.mapTRPCCodeToSeverity(error.code),
        wasRecovered: false,
      })
      return {
        success: false,
        error: {
          code: error.code,
          message: translated.technicalMessage,
          userMessage: translated.userMessage,
          timestamp,
          requestId,
        },
      }
    }
    // Zodバリデーションエラーの処理
    if (error instanceof z.ZodError) {
      const translated = translateZodError(error)
      trackError({
        errorCode: 400,
        errorCategory: 'Validation',
        severity: 'medium',
        wasRecovered: false,
      })
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          userMessage: translated.message,
          details: translated.details,
          timestamp,
          requestId,
        },
      }
    }
    // AppErrorの処理
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const appError = error as AppError
      trackError({
        errorCode: 500,
        errorCategory: 'Application',
        severity: 'high',
        wasRecovered: false,
      })
      return {
        success: false,
        error: {
          code: appError.code,
          message: appError.message,
          userMessage: appError.userMessage || 'エラーが発生しました',
          details: appError.context,
          timestamp,
          requestId,
        },
      }
    }
    // 一般的なエラーの処理
    const errorMessage = error instanceof Error ? error.message : String(error)
    trackError({
      errorCode: 500,
      errorCategory: 'Unknown',
      severity: 'high',
      wasRecovered: false,
    })
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: errorMessage,
        userMessage: 'サーバーエラーが発生しました。しばらく時間をおいて再試行してください。',
        timestamp,
        requestId,
      },
    }
  }
  /**
   * 成功レスポンスを生成
   */
  static createSuccessResponse<T>(
    data: T,
    requestId?: string
  ): APISuccessResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: requestId || crypto.randomUUID(),
    }
  }
  /**
   * tRPCエラーコードを数値にマッピング
   */
  private static mapTRPCCodeToNumber(code: string): number {
    const mapping: Record<string, number> = {
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      METHOD_NOT_SUPPORTED: 405,
      TIMEOUT: 408,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      UNPROCESSABLE_CONTENT: 422,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
      INTERNAL_SERVER_ERROR: 500,
    }
    return mapping[code] || 500
  }
  /**
   * tRPCエラーコードを重要度にマッピング
   */
  private static mapTRPCCodeToSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (code) {
      case 'BAD_REQUEST':
      case 'UNPROCESSABLE_CONTENT':
        return 'medium'
      case 'UNAUTHORIZED':
      case 'FORBIDDEN':
        return 'high'
      case 'INTERNAL_SERVER_ERROR':
        return 'critical'
      default:
        return 'medium'
    }
  }
}
/**
 * React用エラーハンドリングフック
 */
export function useErrorHandler() {
  const handleError = (error: unknown, context?: { operation?: string }) => {
    const errorResponse = APIErrorHandler.handleError(error, context)
    // エラーログの出力（安全なJSON処理）
    console.error('API Error:', safeJsonStringify({
      ...errorResponse.error,
      context,
    }, 2))
    return errorResponse
  }
  const handleZodError = (error: z.ZodError) => {
    const translated = translateZodError(error)
    console.warn('Validation Error:', translated)
    return translated
  }
  const handleTRPCError = (error: TRPCError) => {
    const translated = translateTRPCError(error)
    console.error('tRPC Error:', translated)
    return translated
  }
  return {
    handleError,
    handleZodError,
    handleTRPCError,
  }
}