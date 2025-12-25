/**
 * 7000番台: 外部サービス連携系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const EXTERNAL_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.EXTERNAL_API_CONNECTION]: {
    technical: '外部API接続エラーが発生しました',
    userFriendly: '外部サービスとの接続で問題が発生しました',
    short: '外部サービスエラー',
    description: '連携している外部サービスで一時的な問題が発生しています。',
    recommendedActions: [
      '時間をおいて再試行',
      '外部サービスの状況を確認',
      '別の方法での作業を検討',
    ],
    autoRecoverable: true,
    urgency: 'warning',
    emoji: '🔗',
  },

  [ERROR_CODES.EXTERNAL_SERVICE_MAINTENANCE]: {
    technical: '外部サービスがメンテナンス中です',
    userFriendly: '連携サービスがメンテナンス中のため利用できません',
    short: 'メンテナンス中',
    description: '連携している外部サービスが定期メンテナンスを実施中です。',
    recommendedActions: [
      'メンテナンス終了まで待機',
      '代替機能があるかサポートに確認',
      'メンテナンス予定をお知らせで確認',
    ],
    autoRecoverable: false,
    urgency: 'info',
    emoji: '🔧',
  },
};
