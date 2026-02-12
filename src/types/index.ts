/**
 * Dayopt 統一型定義
 *
 * TypeScript公式ベストプラクティス準拠:
 * - any型禁止
 * - interface優先（拡張可能性）
 * - type使用可（Union Types）
 *
 * 参考: CLAUDE.md
 */

// ============================================
// 1. メインエンティティ（interface優先）
// ============================================

/**
 * ユーザープロフィール
 */
export interface Profile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * ユーザー設定値
 */
export interface UserValues {
  id: string;
  user_id: string;
  key: string;
  value: string;
}

// ============================================
// 2. データ操作型（TypeScript公式: Utility Types活用）
// ============================================

/**
 * プロフィール更新入力
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

// ============================================
// 3. 他モジュールからの再エクスポート
// ============================================

// 共通型
export * from './chronotype';
export * from './common';
export * from './tags';
export * from './trash';
