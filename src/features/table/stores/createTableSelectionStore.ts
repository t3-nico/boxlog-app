import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * 選択ストアの状態
 */
export interface TableSelectionState {
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
 * 選択ストアのファクトリー設定
 */
export interface CreateTableSelectionStoreConfig {
  /** devtools 表示名 */
  storeName?: string;
}

/**
 * テーブル選択ストアのファクトリー関数
 *
 * @example
 * ```typescript
 * export const useInboxSelectionStore = createTableSelectionStore({
 *   storeName: 'inbox-selection-store',
 * })
 *
 * export const useTagSelectionStore = createTableSelectionStore({
 *   storeName: 'tag-selection-store',
 * })
 * ```
 */
export function createTableSelectionStore(config: CreateTableSelectionStoreConfig = {}) {
  const { storeName = 'table-selection-store' } = config;

  return create<TableSelectionState>()(
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
      { name: storeName },
    ),
  );
}
