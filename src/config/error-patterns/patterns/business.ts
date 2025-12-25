/**
 * 6000番台: ビジネスロジック系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const BUSINESS_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: {
    technical: 'ビジネスルールに違反しています',
    userFriendly: '業務ルールに合わない操作です',
    short: 'ルール違反',
    description: '設定されている業務ルールに適合しない操作を実行しようとしています。',
    recommendedActions: [
      '操作手順を確認',
      '管理者にルールの確認を依頼',
      'ヘルプドキュメントを参照',
    ],
    autoRecoverable: false,
    urgency: 'warning',
    emoji: '📋',
  },
};
