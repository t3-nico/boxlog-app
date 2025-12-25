import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TagDisplayMode = 'flat' | 'grouped';

interface TagDisplayModeState {
  /** 表示モード: フラット or グループ別 */
  displayMode: TagDisplayMode;
  /** 表示モードを設定 */
  setDisplayMode: (mode: TagDisplayMode) => void;
}

/**
 * タグ表示モード管理ストア
 *
 * - flat: すべてのタグをフラットに表示
 * - grouped: グループごとにセクション分けして表示
 */
export const useTagDisplayModeStore = create<TagDisplayModeState>()(
  persist(
    (set) => ({
      displayMode: 'flat',
      setDisplayMode: (mode) => set({ displayMode: mode }),
    }),
    {
      name: 'tag-display-mode',
    },
  ),
);
