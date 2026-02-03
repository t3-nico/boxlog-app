/**
 * Table Column Type Definitions
 *
 * テーブルの列設定の型定義
 */

/**
 * テーブルタイプ
 */
export type TableType = 'plan' | 'record';

/**
 * Plan テーブル用の列ID
 */
export type PlanColumnId =
  | 'selection'
  | 'title'
  | 'tags'
  | 'duration'
  | 'records'
  | 'created_at'
  | 'updated_at';

/**
 * Record テーブル用の列ID
 */
export type RecordColumnId =
  | 'selection'
  | 'title'
  | 'plan'
  | 'tags'
  | 'worked_at'
  | 'duration_minutes'
  | 'fulfillment_score'
  | 'created_at'
  | 'updated_at';

/**
 * 列ID（後方互換性）
 */
export type ColumnId = PlanColumnId | RecordColumnId;

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
