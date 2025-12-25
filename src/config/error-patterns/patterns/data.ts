/**
 * 3000番台: データ・データベース系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const DATA_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.DATA_NOT_FOUND]: {
    technical: '指定されたデータが見つかりません',
    userFriendly: '探している情報が見つかりません',
    short: 'データなし',
    description: '要求された情報が削除されているか、アクセス権限がない可能性があります。',
    recommendedActions: [
      'ホーム画面から改めて探す',
      'ページを更新してみる',
      '削除されている可能性を確認',
    ],
    autoRecoverable: false,
    urgency: 'info',
    emoji: '🔍',
  },

  [ERROR_CODES.DATA_DUPLICATE]: {
    technical: '重複データの作成が試行されました',
    userFriendly: '同じ内容のデータが既に存在しています',
    short: '重複データ',
    description: 'システム内に同一の情報が既に登録されています。',
    recommendedActions: [
      '既存のデータを確認・編集',
      '異なる名前や内容に変更',
      '既存データの削除が必要な場合は管理者に相談',
    ],
    autoRecoverable: false,
    urgency: 'warning',
    emoji: '📋',
  },

  [ERROR_CODES.DATA_VALIDATION_ERROR]: {
    technical: 'データ検証エラーが発生しました',
    userFriendly: '入力された情報の形式が正しくありません',
    short: '入力形式エラー',
    description: '入力規則に合わない情報が含まれています。',
    recommendedActions: [
      '入力形式の例を参考に修正',
      '必須項目の入力漏れを確認',
      '文字数や形式の制限を確認',
    ],
    autoRecoverable: false,
    urgency: 'error',
    emoji: '⚠️',
  },
};
