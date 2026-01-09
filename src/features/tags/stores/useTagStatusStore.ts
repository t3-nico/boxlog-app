import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * タグステータスタイプ
 * - all: アクティブなタグ（is_active = true）
 * - archive: アーカイブされたタグ（is_active = false）
 */
export type TagStatus = 'all' | 'archive';

/**
 * タグステータス状態
 */
interface TagStatusState {
  status: TagStatus;
}

/**
 * タグステータスストア
 */
interface TagStatusStore extends TagStatusState {
  setStatus: (status: TagStatus) => void;
  reset: () => void;
}

/**
 * 初期状態
 */
const initialState: TagStatusState = {
  status: 'all',
};

/**
 * タグステータスストア
 *
 * All/Archive の切り替え状態を管理
 * - localStorageに永続化
 */
export const useTagStatusStore = create<TagStatusStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setStatus: (status) => set({ status }),
        reset: () => set(initialState),
      }),
      {
        name: 'tag-status-store',
      },
    ),
    { name: 'tag-status-store' },
  ),
);
