// @ts-nocheck TODO(#389): 型エラー2件を段階的に修正する
/**
 * エラー分析ユーティリティ
 * GlobalErrorBoundaryで使用するエラー分析ロジック
 */

import { getErrorPattern, getRecommendedActions } from '@/config/error-patterns'
import { ERROR_CODES, ErrorCode, getErrorCategory, getErrorSeverity } from '@/constants/errorCodes'

export interface ErrorAnalysis {
  code: ErrorCode
  category: string
  severity: string
  recoverable: boolean
  autoRetryable: boolean
  suggestedActions: string[]
}

/**
 * エラーメッセージからエラーコードを推定
 */
export function estimateErrorCodeFromMessage(message: string): ErrorCode | null {
  const lowerMessage = message.toLowerCase()

  // 認証関連
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
    if (lowerMessage.includes('expired') || lowerMessage.includes('timeout')) {
      return ERROR_CODES.AUTH_EXPIRED
    }
    if (lowerMessage.includes('invalid') || lowerMessage.includes('token')) {
      return ERROR_CODES.AUTH_INVALID_TOKEN
    }
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
      return ERROR_CODES.AUTH_NO_PERMISSION
    }
    return ERROR_CODES.AUTH_INVALID_TOKEN
  }

  // ネットワーク関連
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return ERROR_CODES.SYSTEM_NETWORK_ERROR
  }

  // API関連
  if (lowerMessage.includes('429') || lowerMessage.includes('rate limit')) {
    return ERROR_CODES.API_RATE_LIMIT
  }
  if (lowerMessage.includes('timeout')) {
    return ERROR_CODES.API_TIMEOUT
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('server error')) {
    return ERROR_CODES.API_SERVER_ERROR
  }

  // データ関連
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return ERROR_CODES.DATA_NOT_FOUND
  }
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return ERROR_CODES.DATA_DUPLICATE
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ERROR_CODES.DATA_VALIDATION_ERROR
  }

  // UI関連
  if (lowerMessage.includes('component') || lowerMessage.includes('render')) {
    return ERROR_CODES.UI_COMPONENT_ERROR
  }

  // ChunkLoadError など React固有
  if (lowerMessage.includes('chunkloaderror') || lowerMessage.includes('loading chunk')) {
    return ERROR_CODES.UI_PERFORMANCE_ERROR
  }

  return null
}

/**
 * エラーを包括的に分析
 * error-patterns.ts の情報と統合して詳細な分析結果を返す
 */
export function analyzeError(error: Error): ErrorAnalysis {
  let code = ERROR_CODES.UI_COMPONENT_ERROR
  let recoverable = true
  let autoRetryable = false

  // 1. error-patterns.tsの推定機能を使用してエラーコードを特定
  const estimatedCode = estimateErrorCodeFromMessage(error.message)
  if (estimatedCode) {
    code = estimatedCode
  }

  // 2. error-patterns.tsから詳細な情報を取得
  const pattern = getErrorPattern(code)
  if (pattern) {
    recoverable = pattern.autoRecoverable || true
    autoRetryable = pattern.autoRecoverable
  }

  // 3. React固有のエラーの追加判定
  if (error.name === 'ChunkLoadError') {
    code = ERROR_CODES.UI_PERFORMANCE_ERROR
    autoRetryable = true
  }

  const category = getErrorCategory(code)
  const severity = getErrorSeverity(code)

  // 4. 推奨アクションを error-patterns.ts から取得
  const suggestedActions = getRecommendedActions(code)

  return {
    code,
    category,
    severity,
    recoverable,
    autoRetryable,
    suggestedActions,
  }
}
