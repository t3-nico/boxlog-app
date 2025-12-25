import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Board一括選択状態
 */
interface BoardSelectionState {
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  getSelectedIds: () => Set<string>;
}

/**
 * Board一括選択ストア
 *
 * カンバンボードでの一括選択状態を管理
 * - selectedIds: 選択されたカードのIDセット
 * - toggleSelection: 個別選択の切り替え
 * - toggleAll: 全選択/全解除の切り替え
 * - clearSelection: 選択状態のクリア
 *
 * @example
 * ```tsx
 * const { selectedIds, toggleSelection, isSelected } = useBoardSelectionStore()
 *
 * // 個別選択
 * toggleSelection('card-id')
 *
 * // 選択状態確認
 * const selected = isSelected('card-id')
 * ```
 */
export const useBoardSelectionStore = create<BoardSelectionState>()(
  devtools(
    (set, get) => ({
      selectedIds: new Set(),

      toggleSelection: (id) => {
        const { selectedIds } = get();
        const newSet = new Set(selectedIds);

        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }

        set({ selectedIds: newSet });
      },

      toggleAll: (ids) => {
        const { selectedIds } = get();
        const allSelected = ids.every((id) => selectedIds.has(id));

        if (allSelected) {
          set({ selectedIds: new Set() });
        } else {
          set({ selectedIds: new Set(ids) });
        }
      },

      setSelectedIds: (ids) => set({ selectedIds: new Set(ids) }),

      clearSelection: () => set({ selectedIds: new Set() }),

      isSelected: (id) => get().selectedIds.has(id),

      getSelectedCount: () => get().selectedIds.size,

      getSelectedIds: () => get().selectedIds,
    }),
    { name: 'board-selection-store' },
  ),
);
