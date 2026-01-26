/**
 * 共通テーブルコンポーネント
 *
 * plan/record 両方で使用できる汎用テーブルUIコンポーネント
 *
 * @example
 * ```tsx
 * import {
 *   FilterContent,
 *   SelectionActions,
 *   SelectionBar,
 *   SettingsContent,
 *   TableEmptyState,
 *   ActionMenuItems,
 *   ResizableTableHead,
 *   BulkDatePickerDialog,
 *   BulkTagSelectDialog,
 *   GroupHeader,
 * } from '@/components/table';
 * ```
 */

// フィルターUI
export { FilterContent } from './FilterContent';
export type {
  CheckboxFilterConfig,
  FilterConfig,
  FilterOption,
  RadioFilterConfig,
} from './FilterContent';

// 選択アクション
export { SelectionActions } from './SelectionActions';
export type { ActionButton, MenuItem } from './SelectionActions';

// 選択バー
export { SelectionBar } from './SelectionBar';

// 設定UI
export { SettingsContent } from './SettingsContent';
export type { ColumnSetting, GroupByOption } from './SettingsContent';

// 空状態
export { TableEmptyState } from './TableEmptyState';

// アクションメニュー
export { ActionMenuItems } from './ActionMenuItems';
export type { ActionGroup } from './ActionMenuItems';

// リサイズ可能テーブルヘッダー
export { ResizableTableHead } from './ResizableTableHead';

// 一括日付選択ダイアログ
export { BulkDatePickerDialog } from './BulkDatePickerDialog';

// 一括タグ選択ダイアログ
export { BulkTagSelectDialog } from './BulkTagSelectDialog';
export type { TagItem } from './BulkTagSelectDialog';

// グループヘッダー
export { GroupHeader } from './GroupHeader';
