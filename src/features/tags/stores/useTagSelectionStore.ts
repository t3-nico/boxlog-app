import { createTableSelectionStore } from '@/features/table';

/**
 * タグ一括選択ストア
 *
 * features/table の createTableSelectionStore を使用
 * - selectedIds: 選択されたタグのIDセット
 * - toggleSelection: 個別選択の切り替え
 * - toggleAll: 全選択/全解除の切り替え
 * - clearSelection: 選択状態のクリア
 */
export const useTagSelectionStore = createTableSelectionStore({
  storeName: 'tag-selection-store',
});
