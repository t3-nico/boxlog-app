import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * フォーカスストアの状態
 */
export interface TableFocusState {
  /** 現在フォーカス中のアイテムID */
  focusedId: string | null;
  /** フォーカスをセット */
  setFocusedId: (id: string | null) => void;
  /** 次の行にフォーカス移動 */
  focusNext: (ids: string[]) => void;
  /** 前の行にフォーカス移動 */
  focusPrevious: (ids: string[]) => void;
  /** フォーカスをクリア */
  clearFocus: () => void;
}

/**
 * フォーカスストアのファクトリー設定
 */
export interface CreateTableFocusStoreConfig {
  /** devtools 表示名 */
  storeName?: string;
}

/**
 * テーブルフォーカスストアのファクトリー関数
 *
 * キーボードショートカットによる行フォーカスを管理
 * - j/k キーでの上下移動
 * - Enter でのInspector開く
 * - x でのチェックボックストグル
 *
 * @example
 * ```typescript
 * export const useInboxFocusStore = createTableFocusStore({
 *   storeName: 'inbox-focus-store',
 * })
 *
 * export const useTagFocusStore = createTableFocusStore({
 *   storeName: 'tag-focus-store',
 * })
 * ```
 */
export function createTableFocusStore(config: CreateTableFocusStoreConfig = {}) {
  const { storeName = 'table-focus-store' } = config;

  return create<TableFocusState>()(
    devtools(
      (set, get) => ({
        focusedId: null,

        setFocusedId: (id) => set({ focusedId: id }),

        focusNext: (ids) => {
          const { focusedId } = get();
          if (ids.length === 0) return;

          if (!focusedId) {
            set({ focusedId: ids[0] ?? null });
            return;
          }

          const currentIndex = ids.findIndex((id) => id === focusedId);
          if (currentIndex === -1 || currentIndex === ids.length - 1) {
            return;
          }

          set({ focusedId: ids[currentIndex + 1] ?? null });
        },

        focusPrevious: (ids) => {
          const { focusedId } = get();
          if (ids.length === 0) return;

          if (!focusedId) {
            set({ focusedId: ids[0] ?? null });
            return;
          }

          const currentIndex = ids.findIndex((id) => id === focusedId);
          if (currentIndex === -1 || currentIndex === 0) {
            return;
          }

          set({ focusedId: ids[currentIndex - 1] ?? null });
        },

        clearFocus: () => set({ focusedId: null }),
      }),
      { name: storeName },
    ),
  );
}
