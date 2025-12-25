/**
 * 4000番台: UI・フロントエンド系エラーパターン
 */

import { ERROR_CODES } from '@/constants/errorCodes';

import type { ErrorMessagePattern } from '../types';

export const UI_ERROR_PATTERNS: Record<number, ErrorMessagePattern> = {
  [ERROR_CODES.UI_COMPONENT_ERROR]: {
    technical: 'UIコンポーネントでエラーが発生しました',
    userFriendly: '画面の表示に問題が発生しました',
    short: '画面表示エラー',
    description: '画面の一部が正しく表示されていない可能性があります。',
    recommendedActions: [
      'ページを再読み込み',
      'ブラウザのキャッシュをクリア',
      '他のブラウザで試してみる',
    ],
    autoRecoverable: true,
    urgency: 'warning',
    emoji: '🖥️',
  },

  [ERROR_CODES.UI_RENDER_ERROR]: {
    technical: 'レンダリングエラーが発生しました',
    userFriendly: '画面の描画で問題が発生しました',
    short: '描画エラー',
    description: '画面の表示処理で予期しない問題が発生しました。',
    recommendedActions: ['ページを更新してみる', '一度戻って再度アクセス', 'ブラウザを再起動'],
    autoRecoverable: true,
    urgency: 'warning',
    emoji: '🎨',
  },
};
