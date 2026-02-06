import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_SIDEBAR_SIZE = 18; // デフォルト18%（約260px / 1440px）

interface SidebarSizeState {
  /** サイドバーのサイズ（%） */
  sidebarSize: number;
  /** サイドバーサイズを設定 */
  setSidebarSize: (size: number) => void;
}

/**
 * サイドバーサイズの永続化ストア
 *
 * localStorageに保存し、リロード後も維持
 */
export const useSidebarSizeStore = create<SidebarSizeState>()(
  persist(
    (set) => ({
      sidebarSize: DEFAULT_SIDEBAR_SIZE,
      setSidebarSize: (size) => {
        // 12-30%の範囲に制限
        const validSize = Math.max(12, Math.min(30, size));
        set({ sidebarSize: validSize });
      },
    }),
    {
      name: 'sidebar-size-v2', // キー名変更で古い値をリセット
      version: 1,
      migrate: () => ({
        sidebarSize: DEFAULT_SIDEBAR_SIZE,
      }),
    },
  ),
);
