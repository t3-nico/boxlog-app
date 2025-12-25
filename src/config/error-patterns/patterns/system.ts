/**
 * 5000番台: システム・インフラ系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const SYSTEM_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.SYSTEM_NETWORK_ERROR]: {
    technical: 'ネットワーク接続エラーが発生しました',
    userFriendly: 'インターネット接続に問題があります',
    short: 'ネットワークエラー',
    description: 'インターネット接続が不安定になっているか、切断されています。',
    recommendedActions: [
      'Wi-Fi接続を確認',
      'モバイルデータの場合は電波状況を確認',
      'ルーターの再起動を試す',
    ],
    autoRecoverable: true,
    urgency: 'error',
    emoji: '📡',
  },

  [ERROR_CODES.SYSTEM_CONFIG_ERROR]: {
    technical: 'システム設定エラーが発生しました',
    userFriendly: 'システム設定に問題があります',
    short: '設定エラー',
    description: 'システムの設定に問題があり、正常に動作できません。',
    recommendedActions: [
      'サポートチームに連絡',
      '管理者にシステム設定の確認を依頼',
      '一時的に別の機能を利用',
    ],
    autoRecoverable: false,
    urgency: 'critical',
    emoji: '⚙️',
  },
};
