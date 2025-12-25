/**
 * エラーパターンヘルパー関数
 */

import type { ErrorCode, ErrorLevel } from '@/constants/errorCodes';
import { ERROR_CODES } from '@/constants/errorCodes';

import { ERROR_MESSAGE_PATTERNS } from './patterns';
import type { ErrorMessagePattern } from './types';

/**
 * エラーコードから適切なメッセージパターンを取得
 */
export function getErrorPattern(errorCode: ErrorCode): ErrorMessagePattern | null {
  return ERROR_MESSAGE_PATTERNS[errorCode] || null;
}

/**
 * Error オブジェクトからエラーコードを推定
 */
export function estimateErrorCode(error: Error): ErrorCode | null {
  const message = error.message.toLowerCase();

  // 認証関連
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
    if (message.includes('expired') || message.includes('timeout')) {
      return ERROR_CODES.AUTH_EXPIRED;
    }
    if (message.includes('invalid') || message.includes('token')) {
      return ERROR_CODES.AUTH_INVALID_TOKEN;
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return ERROR_CODES.AUTH_NO_PERMISSION;
    }
    return ERROR_CODES.AUTH_INVALID_TOKEN;
  }

  // ネットワーク関連
  if (message.includes('network') || message.includes('fetch')) {
    return ERROR_CODES.SYSTEM_NETWORK_ERROR;
  }

  // API関連
  if (message.includes('429') || message.includes('rate limit')) {
    return ERROR_CODES.API_RATE_LIMIT;
  }
  if (message.includes('timeout')) {
    return ERROR_CODES.API_TIMEOUT;
  }
  if (message.includes('500') || message.includes('server error')) {
    return ERROR_CODES.API_SERVER_ERROR;
  }

  // データ関連
  if (message.includes('not found') || message.includes('404')) {
    return ERROR_CODES.DATA_NOT_FOUND;
  }
  if (message.includes('duplicate') || message.includes('already exists')) {
    return ERROR_CODES.DATA_DUPLICATE;
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ERROR_CODES.DATA_VALIDATION_ERROR;
  }

  // UI関連
  if (message.includes('component') || message.includes('render')) {
    return ERROR_CODES.UI_COMPONENT_ERROR;
  }

  return null;
}

/**
 * エラーからユーザーフレンドリーメッセージを生成
 */
export function getUserFriendlyMessage(error: Error | ErrorCode, context?: string): string {
  let pattern: ErrorMessagePattern | null = null;

  if (typeof error === 'number') {
    pattern = getErrorPattern(error);
  } else {
    // Error オブジェクトからエラーコードを推測
    const estimatedCode = estimateErrorCode(error);
    if (estimatedCode) {
      pattern = getErrorPattern(estimatedCode);
    }
  }

  if (!pattern) {
    return '予期しない問題が発生しました。しばらく待ってから再試行してください。';
  }

  // コンテキストに応じてメッセージを調整
  if (context === 'toast') {
    return `${pattern.emoji} ${pattern.short}`;
  }

  return pattern.userFriendly;
}

/**
 * 推奨アクションを取得
 */
export function getRecommendedActions(errorCode: ErrorCode): string[] {
  const pattern = getErrorPattern(errorCode);
  return pattern?.recommendedActions || ['ページを再読み込みしてみてください'];
}

/**
 * エラーの自動復旧可能性を判定
 */
export function isAutoRecoverable(errorCode: ErrorCode): boolean {
  const pattern = getErrorPattern(errorCode);
  return pattern?.autoRecoverable || false;
}

/**
 * 統一されたエラートーストメッセージ生成
 */
export function createErrorToast(
  error: Error | ErrorCode,
  customMessage?: string,
): {
  message: string;
  emoji: string;
  duration: number;
  type: 'error' | 'warning' | 'info';
} {
  if (customMessage) {
    return {
      message: customMessage,
      emoji: '⚠️',
      duration: 5000,
      type: 'error',
    };
  }

  const pattern = typeof error === 'number' ? getErrorPattern(error) : null;
  const estimated = typeof error !== 'number' ? estimateErrorCode(error) : null;
  const finalPattern = pattern || (estimated ? getErrorPattern(estimated) : null);

  if (!finalPattern) {
    return {
      message: '予期しないエラーが発生しました',
      emoji: '❌',
      duration: 5000,
      type: 'error',
    };
  }

  return {
    message: finalPattern.short,
    emoji: finalPattern.emoji,
    duration: finalPattern.urgency === 'critical' ? 8000 : 5000,
    type:
      finalPattern.urgency === 'info'
        ? 'info'
        : finalPattern.urgency === 'warning'
          ? 'warning'
          : 'error',
  };
}

/**
 * デベロッパー向け詳細エラー情報取得
 */
export function getDetailedErrorInfo(errorCode: ErrorCode): {
  technical: string;
  userFriendly: string;
  actions: string[];
  recoverable: boolean;
  urgency: ErrorLevel;
} | null {
  const pattern = getErrorPattern(errorCode);

  if (!pattern) {
    return null;
  }

  return {
    technical: pattern.technical,
    userFriendly: pattern.userFriendly,
    actions: pattern.recommendedActions,
    recoverable: pattern.autoRecoverable,
    urgency: pattern.urgency,
  };
}
