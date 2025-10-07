/**
 * エラーメッセージ多言語対応システム
 */

import type { Locale } from '@/types/i18n'

// エラーの種類
export type ErrorType = 'validation' | 'auth' | 'network' | 'permission' | 'business' | 'system'

// エラーコード
export type ErrorCode =
  // バリデーションエラー
  | 'REQUIRED_FIELD'
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'
  | 'PASSWORD_MISMATCH'
  | 'MIN_LENGTH'
  | 'MAX_LENGTH'
  | 'INVALID_FORMAT'

  // 認証エラー
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED'
  | 'TOKEN_INVALID'

  // ネットワークエラー
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'

  // 権限エラー
  | 'ACCESS_DENIED'
  | 'INSUFFICIENT_PERMISSION'
  | 'RESOURCE_FORBIDDEN'

  // ビジネスロジックエラー
  | 'DUPLICATE_ENTRY'
  | 'RESOURCE_NOT_FOUND'
  | 'OPERATION_NOT_ALLOWED'
  | 'CONSTRAINT_VIOLATION'

  // システムエラー
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'MAINTENANCE_MODE'

// エラーメッセージの構造
export interface ErrorMessage {
  code: ErrorCode
  type: ErrorType
  title: string
  message: string
  suggestion?: string
  action?: string
}

// エラーメッセージ辞書（英語）
const errorMessagesEn: Record<ErrorCode, ErrorMessage> = {
  // バリデーションエラー
  REQUIRED_FIELD: {
    code: 'REQUIRED_FIELD',
    type: 'validation',
    title: 'Required Field',
    message: '{{field}} is required.',
    suggestion: 'Please fill in the required field.',
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    type: 'validation',
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    suggestion: 'Email format should be: example@domain.com',
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    type: 'validation',
    title: 'Invalid Password',
    message: 'Password must be at least 8 characters long.',
    suggestion: 'Use a combination of letters, numbers, and symbols.',
  },
  PASSWORD_MISMATCH: {
    code: 'PASSWORD_MISMATCH',
    type: 'validation',
    title: 'Password Mismatch',
    message: 'Passwords do not match.',
    suggestion: 'Please ensure both password fields are identical.',
  },
  MIN_LENGTH: {
    code: 'MIN_LENGTH',
    type: 'validation',
    title: 'Too Short',
    message: '{{field}} must be at least {{min}} characters long.',
  },
  MAX_LENGTH: {
    code: 'MAX_LENGTH',
    type: 'validation',
    title: 'Too Long',
    message: '{{field}} must be no more than {{max}} characters long.',
  },
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    type: 'validation',
    title: 'Invalid Format',
    message: '{{field}} has an invalid format.',
    suggestion: 'Please check the format and try again.',
  },

  // 認証エラー
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    type: 'auth',
    title: 'Invalid Credentials',
    message: 'Invalid email or password.',
    suggestion: 'Please check your credentials and try again.',
    action: 'Forgot Password?',
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    type: 'auth',
    title: 'Account Locked',
    message: 'Your account has been locked due to multiple failed attempts.',
    suggestion: 'Please try again later or contact support.',
    action: 'Contact Support',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    type: 'auth',
    title: 'Session Expired',
    message: 'Your session has expired.',
    suggestion: 'Please log in again to continue.',
    action: 'Log In',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    type: 'auth',
    title: 'Unauthorized',
    message: 'You are not authorized to perform this action.',
    suggestion: 'Please log in with appropriate permissions.',
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    type: 'auth',
    title: 'Invalid Token',
    message: 'The authentication token is invalid or expired.',
    action: 'Log In Again',
  },

  // ネットワークエラー
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    type: 'network',
    title: 'Network Error',
    message: 'Unable to connect to the server.',
    suggestion: 'Please check your internet connection and try again.',
    action: 'Retry',
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    type: 'network',
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    suggestion: 'Please try again later.',
    action: 'Retry',
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    type: 'network',
    title: 'Server Error',
    message: 'An error occurred on the server.',
    suggestion: 'Please try again later or contact support.',
    action: 'Retry',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    type: 'network',
    title: 'Not Found',
    message: 'The requested resource was not found.',
    suggestion: 'Please check the URL or contact support.',
  },
  RATE_LIMIT: {
    code: 'RATE_LIMIT',
    type: 'network',
    title: 'Rate Limit Exceeded',
    message: 'Too many requests. Please slow down.',
    suggestion: 'Please wait a moment before trying again.',
  },

  // 権限エラー
  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    type: 'permission',
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    suggestion: 'Please contact an administrator for access.',
  },
  INSUFFICIENT_PERMISSION: {
    code: 'INSUFFICIENT_PERMISSION',
    type: 'permission',
    title: 'Insufficient Permission',
    message: 'You do not have sufficient permissions for this action.',
    suggestion: 'Please request additional permissions from an administrator.',
  },
  RESOURCE_FORBIDDEN: {
    code: 'RESOURCE_FORBIDDEN',
    type: 'permission',
    title: 'Resource Forbidden',
    message: 'Access to this resource is forbidden.',
  },

  // ビジネスロジックエラー
  DUPLICATE_ENTRY: {
    code: 'DUPLICATE_ENTRY',
    type: 'business',
    title: 'Duplicate Entry',
    message: 'This {{resource}} already exists.',
    suggestion: 'Please use a different {{field}} or update the existing entry.',
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    type: 'business',
    title: 'Resource Not Found',
    message: 'The requested {{resource}} was not found.',
    suggestion: 'Please verify the {{resource}} exists and try again.',
  },
  OPERATION_NOT_ALLOWED: {
    code: 'OPERATION_NOT_ALLOWED',
    type: 'business',
    title: 'Operation Not Allowed',
    message: 'This operation is not allowed in the current state.',
    suggestion: 'Please check the requirements and try again.',
  },
  CONSTRAINT_VIOLATION: {
    code: 'CONSTRAINT_VIOLATION',
    type: 'business',
    title: 'Constraint Violation',
    message: 'The operation violates a business constraint.',
    suggestion: 'Please review the requirements and modify your request.',
  },

  // システムエラー
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    type: 'system',
    title: 'Internal Error',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again later or contact support if the problem persists.',
    action: 'Contact Support',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    type: 'system',
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable.',
    suggestion: 'Please try again later.',
    action: 'Retry',
  },
  MAINTENANCE_MODE: {
    code: 'MAINTENANCE_MODE',
    type: 'system',
    title: 'Maintenance Mode',
    message: 'The system is currently under maintenance.',
    suggestion: 'Please try again after maintenance is complete.',
  },
}

// エラーメッセージ辞書（日本語）
const errorMessagesJa: Record<ErrorCode, ErrorMessage> = {
  // バリデーションエラー
  REQUIRED_FIELD: {
    code: 'REQUIRED_FIELD',
    type: 'validation',
    title: '必須項目',
    message: '{{field}}は必須です。',
    suggestion: '必須項目を入力してください。',
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    type: 'validation',
    title: 'メールアドレスが無効',
    message: '有効なメールアドレスを入力してください。',
    suggestion: 'メール形式：example@domain.com',
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    type: 'validation',
    title: 'パスワードが無効',
    message: 'パスワードは8文字以上である必要があります。',
    suggestion: '文字、数字、記号を組み合わせて使用してください。',
  },
  PASSWORD_MISMATCH: {
    code: 'PASSWORD_MISMATCH',
    type: 'validation',
    title: 'パスワード不一致',
    message: 'パスワードが一致しません。',
    suggestion: '両方のパスワード欄が同じであることを確認してください。',
  },
  MIN_LENGTH: {
    code: 'MIN_LENGTH',
    type: 'validation',
    title: '文字数不足',
    message: '{{field}}は{{min}}文字以上である必要があります。',
  },
  MAX_LENGTH: {
    code: 'MAX_LENGTH',
    type: 'validation',
    title: '文字数超過',
    message: '{{field}}は{{max}}文字以下である必要があります。',
  },
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    type: 'validation',
    title: '形式が無効',
    message: '{{field}}の形式が無効です。',
    suggestion: '形式を確認してもう一度お試しください。',
  },

  // 認証エラー
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    type: 'auth',
    title: '認証情報が無効',
    message: 'メールアドレスまたはパスワードが正しくありません。',
    suggestion: '認証情報を確認してもう一度お試しください。',
    action: 'パスワードを忘れた方',
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    type: 'auth',
    title: 'アカウントロック',
    message: '複数回の失敗により、アカウントがロックされました。',
    suggestion: '時間をおいてからお試しいただくか、サポートにお問い合わせください。',
    action: 'サポートに連絡',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    type: 'auth',
    title: 'セッション期限切れ',
    message: 'セッションの有効期限が切れました。',
    suggestion: '続行するには再度ログインしてください。',
    action: 'ログイン',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    type: 'auth',
    title: '権限なし',
    message: 'このアクションを実行する権限がありません。',
    suggestion: '適切な権限でログインしてください。',
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    type: 'auth',
    title: 'トークン無効',
    message: '認証トークンが無効または期限切れです。',
    action: '再ログイン',
  },

  // ネットワークエラー
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    type: 'network',
    title: 'ネットワークエラー',
    message: 'サーバーに接続できません。',
    suggestion: 'インターネット接続を確認してもう一度お試しください。',
    action: '再試行',
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    type: 'network',
    title: 'リクエストタイムアウト',
    message: 'リクエストの完了に時間がかかりすぎました。',
    suggestion: '後でもう一度お試しください。',
    action: '再試行',
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    type: 'network',
    title: 'サーバーエラー',
    message: 'サーバーでエラーが発生しました。',
    suggestion: '後でもう一度お試しいただくか、サポートにお問い合わせください。',
    action: '再試行',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    type: 'network',
    title: '見つかりません',
    message: '要求されたリソースが見つかりませんでした。',
    suggestion: 'URLを確認するか、サポートにお問い合わせください。',
  },
  RATE_LIMIT: {
    code: 'RATE_LIMIT',
    type: 'network',
    title: 'レート制限超過',
    message: 'リクエストが多すぎます。ペースを落としてください。',
    suggestion: '少し待ってからもう一度お試しください。',
  },

  // 権限エラー
  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    type: 'permission',
    title: 'アクセス拒否',
    message: 'このリソースにアクセスする権限がありません。',
    suggestion: 'アクセス権限について管理者にお問い合わせください。',
  },
  INSUFFICIENT_PERMISSION: {
    code: 'INSUFFICIENT_PERMISSION',
    type: 'permission',
    title: '権限不足',
    message: 'このアクションに必要な権限がありません。',
    suggestion: '管理者に追加の権限を要求してください。',
  },
  RESOURCE_FORBIDDEN: {
    code: 'RESOURCE_FORBIDDEN',
    type: 'permission',
    title: 'リソース禁止',
    message: 'このリソースへのアクセスは禁止されています。',
  },

  // ビジネスロジックエラー
  DUPLICATE_ENTRY: {
    code: 'DUPLICATE_ENTRY',
    type: 'business',
    title: '重複エントリ',
    message: 'この{{resource}}は既に存在します。',
    suggestion: '異なる{{field}}を使用するか、既存のエントリを更新してください。',
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    type: 'business',
    title: 'リソースが見つかりません',
    message: '要求された{{resource}}が見つかりませんでした。',
    suggestion: '{{resource}}が存在することを確認してもう一度お試しください。',
  },
  OPERATION_NOT_ALLOWED: {
    code: 'OPERATION_NOT_ALLOWED',
    type: 'business',
    title: '操作は許可されていません',
    message: '現在の状態では、この操作は許可されていません。',
    suggestion: '要件を確認してもう一度お試しください。',
  },
  CONSTRAINT_VIOLATION: {
    code: 'CONSTRAINT_VIOLATION',
    type: 'business',
    title: '制約違反',
    message: '操作がビジネス制約に違反しています。',
    suggestion: '要件を確認してリクエストを修正してください。',
  },

  // システムエラー
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    type: 'system',
    title: '内部エラー',
    message: '予期しないエラーが発生しました。',
    suggestion: '後でもう一度お試しいただくか、問題が続く場合はサポートにお問い合わせください。',
    action: 'サポートに連絡',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    type: 'system',
    title: 'サービス利用不可',
    message: 'サービスは一時的に利用できません。',
    suggestion: '後でもう一度お試しください。',
    action: '再試行',
  },
  MAINTENANCE_MODE: {
    code: 'MAINTENANCE_MODE',
    type: 'system',
    title: 'メンテナンスモード',
    message: 'システムは現在メンテナンス中です。',
    suggestion: 'メンテナンス完了後にもう一度お試しください。',
  },
}

// エラーメッセージ辞書
const errorMessages: Record<Locale, Record<ErrorCode, ErrorMessage>> = {
  en: errorMessagesEn,
  ja: errorMessagesJa,
}

// 変数補間関数
const interpolate = (text: string, variables?: Record<string, string | number>): string => {
  if (!variables) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return (key in variables) ? variables[key]?.toString() || match : match
  })
}

// エラーメッセージ取得関数
export const getErrorMessage = (
  code: ErrorCode,
  locale: Locale = 'en',
  variables?: Record<string, string | number>
): ErrorMessage => {
  const message = errorMessages[locale]?.[code] || errorMessages.en[code]

  if (!message) {
    return {
      code: 'INTERNAL_ERROR',
      type: 'system',
      title: locale === 'ja' ? '不明なエラー' : 'Unknown Error',
      message: locale === 'ja' ? '不明なエラーが発生しました' : 'An unknown error occurred',
    }
  }

  return {
    ...message,
    title: interpolate(message.title, variables),
    message: interpolate(message.message, variables),
    suggestion: message.suggestion ? interpolate(message.suggestion, variables) : undefined,
    action: message.action ? interpolate(message.action, variables) : undefined,
  }
}

// エラータイプ別の取得
export const getErrorMessagesByType = (type: ErrorType, locale: Locale = 'en'): ErrorMessage[] => {
  const messages = errorMessages[locale] || errorMessages.en

  return Object.values(messages).filter((message) => message.type === type)
}

// カスタムエラークラス
export class LocalizedError extends Error {
  public readonly code: ErrorCode
  public readonly type: ErrorType
  public readonly locale: Locale
  public readonly variables?: Record<string, string | number>

  constructor(code: ErrorCode, locale: Locale = 'en', variables?: Record<string, string | number>) {
    const errorMessage = getErrorMessage(code, locale, variables)
    super(errorMessage.message)

    this.name = 'LocalizedError'
    this.code = code
    this.type = errorMessage.type
    this.locale = locale
    this.variables = variables
  }

  public getLocalizedMessage(): ErrorMessage {
    return getErrorMessage(this.code, this.locale, this.variables)
  }
}
