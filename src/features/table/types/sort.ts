/**
 * Table Sort Type Definitions
 *
 * テーブルのソート機能の型定義
 */

/**
 * ソート対象フィールド
 */
export type SortField = 'title' | 'status' | 'duration' | 'created_at' | 'updated_at';

/**
 * ソート方向
 */
export type SortDirection = 'asc' | 'desc' | null;
