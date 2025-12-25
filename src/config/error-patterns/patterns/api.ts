/**
 * 2000番台: API・ネットワーク系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const API_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.API_RATE_LIMIT]: {
    technical: 'APIレート制限に達しました',
    userFriendly: '短時間で多くの操作を行ったため、一時的に制限されています',
    short: '操作制限中',
    description: 'システム保護のため、短時間での大量操作は制限されています。',
    recommendedActions: [
      '1-2分お待ちください',
      '「再試行」ボタンが表示されたらクリック',
      '今後はゆっくりと操作してください',
    ],
    autoRecoverable: true,
    urgency: 'warning',
    emoji: '🚦',
  },

  [ERROR_CODES.API_INVALID_PARAM]: {
    technical: '無効なAPIパラメータが送信されました',
    userFriendly: '送信された情報に不備があります',
    short: '入力データエラー',
    description: '入力された情報の形式や内容に問題があります。',
    recommendedActions: [
      '入力内容を再度確認してください',
      '必須項目が全て入力されているか確認',
      '文字数制限を超えていないか確認',
    ],
    autoRecoverable: false,
    urgency: 'error',
    emoji: '📝',
  },

  [ERROR_CODES.API_SERVER_ERROR]: {
    technical: 'サーバー内部エラーが発生しました',
    userFriendly: 'サーバーで問題が発生しています',
    short: 'サーバーエラー',
    description: 'システム側で一時的な問題が発生しています。',
    recommendedActions: [
      '少し時間をおいて再試行',
      '問題が続く場合はサポートに連絡',
      '重要なデータは別途保存しておく',
    ],
    autoRecoverable: true,
    urgency: 'error',
    emoji: '🔧',
  },

  [ERROR_CODES.API_TIMEOUT]: {
    technical: 'API接続がタイムアウトしました',
    userFriendly: '応答に時間がかかりすぎています',
    short: '接続タイムアウト',
    description: 'ネットワークの状況や処理の重さにより、応答が遅くなっています。',
    recommendedActions: [
      'インターネット接続を確認',
      '「再試行」ボタンをクリック',
      '時間をおいて再度お試しください',
    ],
    autoRecoverable: true,
    urgency: 'warning',
    emoji: '⏱️',
  },
};
