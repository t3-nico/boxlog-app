/**
 * 統一されたエラーハンドリングシステム
 */

import { ApiError, ApiResponse } from '@/types/unified'

// === エラークラス ===

export class AppError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly details?: unknown

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'リソース') {
    super(`${resource}が見つかりません`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'アクセス権限がありません') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}

// === エラーハンドリングユーティリティ ===

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500
    }
  }

  return {
    message: '予期しないエラーが発生しました',
    code: 'UNKNOWN_ERROR',
    status: 500,
    details: error
  }
}

export function createErrorResponse<T = never>(error: unknown): ApiResponse<T> {
  return {
    success: false,
    error: handleApiError(error)
  }
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  }
}

// === クライアントサイドエラーハンドリング ===

export function handleClientError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '予期しないエラーが発生しました'
}

// === バリデーションヘルパー ===

export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName}は必須です`)
  }
  return value
}

export function validateString(value: unknown, fieldName: string, minLength?: number, maxLength?: number): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName}は文字列である必要があります`)
  }

  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(`${fieldName}は${minLength}文字以上である必要があります`)
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${fieldName}は${maxLength}文字以下である必要があります`)
  }

  return value
}

export function validateEmail(email: unknown): string {
  const emailStr = validateString(email, 'メールアドレス')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(emailStr)) {
    throw new ValidationError('有効なメールアドレスを入力してください')
  }

  return emailStr
}

// === Supabaseエラーハンドリング ===

export function handleSupabaseError(error: any): AppError {
  // Supabaseの特定のエラーコードに対する処理
  if (error?.code === 'PGRST301') {
    return new NotFoundError()
  }

  if (error?.code === '23505') {
    return new ValidationError('既に存在するデータです')
  }

  if (error?.message) {
    return new AppError(error.message, error.code || 'SUPABASE_ERROR', 500, error)
  }

  return new AppError('データベースエラーが発生しました', 'SUPABASE_ERROR', 500, error)
}

// === トーストメッセージ用のヘルパー ===

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return '予期しないエラーが発生しました'
}

export function getSuccessMessage(action: string, resource: string = ''): string {
  const resourceText = resource ? `${resource}を` : ''
  switch (action) {
    case 'create':
      return `${resourceText}作成しました`
    case 'update':
      return `${resourceText}更新しました`
    case 'delete':
      return `${resourceText}削除しました`
    case 'save':
      return `${resourceText}保存しました`
    default:
      return `${action}が完了しました`
  }
}