/**
 * Table Column Type Definitions
 *
 * テーブルの列設定の型定義
 */

/**
 * 列ID
 */
export type ColumnId =
  | 'selection'
  | 'id'
  | 'title'
  | 'status'
  | 'tags'
  | 'duration'
  | 'created_at'
  | 'updated_at';

/**
 * 列設定
 */
export interface ColumnConfig {
  id: ColumnId;
  label: string;
  visible: boolean;
  width: number;
  resizable: boolean;
}
