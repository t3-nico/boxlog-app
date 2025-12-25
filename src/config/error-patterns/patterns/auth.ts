/**
 * 1000番台: 認証・セキュリティ系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const AUTH_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.AUTH_INVALID_TOKEN]: {
    technical: '認証トークンが無効または破損しています',
    userFriendly: 'ログインの有効期限が切れました',
    short: 'ログインが必要です',
    description: 'セキュリティのため、定期的にログインし直していただく必要があります。',
    recommendedActions: [
      '「ログイン」ボタンをクリック',
      'メールアドレスとパスワードを入力',
      'ログイン後、元の画面に自動で戻ります',
    ],
    autoRecoverable: false,
    urgency: 'error',
    emoji: '🔐',
    faqIds: ['auth-001'],
  },

  [ERROR_CODES.AUTH_EXPIRED]: {
    technical: '認証セッションの有効期限が切れています',
    userFriendly: 'セッションの有効期限が切れました',
    short: '再ログインが必要です',
    description: '安全のため、一定時間操作がないとログインが切れる仕組みになっています。',
    recommendedActions: [
      '画面の「再ログイン」ボタンをクリック',
      '作業中のデータは自動保存されています',
      'ログイン後、続きから作業できます',
    ],
    autoRecoverable: false,
    urgency: 'warning',
    emoji: '⏰',
    faqIds: ['auth-002'],
  },

  [ERROR_CODES.AUTH_NO_PERMISSION]: {
    technical: '必要な権限が不足しています',
    userFriendly: 'この機能を使用する権限がありません',
    short: 'アクセス権限がありません',
    description: 'この機能は特定の役割を持つユーザーのみが利用できます。',
    recommendedActions: [
      '管理者にアクセス権限の申請を依頼',
      '別の方法で同じ目的を達成できないか確認',
      'ヘルプデスクにお問い合わせ',
    ],
    autoRecoverable: false,
    urgency: 'warning',
    emoji: '🚫',
    faqIds: ['auth-003'],
  },

  [ERROR_CODES.AUTH_SESSION_TIMEOUT]: {
    technical: 'セッションがタイムアウトしました',
    userFriendly: '操作時間が長すぎたため、セッションが切れました',
    short: 'セッションタイムアウト',
    description: 'セキュリティのため、長時間操作がないとセッションが自動終了します。',
    recommendedActions: [
      '「続行」ボタンをクリック',
      '再度ログイン',
      '今後は定期的に画面を操作してください',
    ],
    autoRecoverable: true,
    urgency: 'warning',
    emoji: '⏳',
  },

  [ERROR_CODES.AUTH_LOGIN_FAILED]: {
    technical: 'ログイン認証に失敗しました',
    userFriendly: 'メールアドレスまたはパスワードが間違っています',
    short: 'ログイン失敗',
    description: '入力されたログイン情報が正しくありません。',
    recommendedActions: [
      'メールアドレスの入力内容を確認',
      'パスワードの大文字小文字を確認',
      'パスワードを忘れた場合は「パスワードリセット」をクリック',
    ],
    autoRecoverable: false,
    urgency: 'error',
    emoji: '❌',
    faqIds: ['auth-004'],
  },
};
