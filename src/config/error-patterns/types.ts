/**
 * エラーメッセージパターン型定義
 *
 * 注: ErrorPatternは既存のindex.tsで定義済み。
 * このファイルではエラーメッセージ定義用の型を提供。
 */

import type { ErrorLevel } from '@/constants/errorCodes';

/**
 * エラーメッセージパターン
 * 各エラーコードに対応するメッセージと復旧情報を定義
 */
export interface ErrorMessagePattern {
  /** 技術者向けメッセージ */
  technical: string;
  /** ユーザーフレンドリーメッセージ */
  userFriendly: string;
  /** 短縮メッセージ（トースト等用） */
  short: string;
  /** 詳細説明（必要に応じて） */
  description: string;
  /** 推奨アクション */
  recommendedActions: string[];
  /** 自動復旧可能か */
  autoRecoverable: boolean;
  /** 緊急度レベル */
  urgency: ErrorLevel;
  /** 絵文字アイコン */
  emoji: string;
  /** 関連するFAQ ID（将来の拡張用） */
  faqIds?: string[];
}
