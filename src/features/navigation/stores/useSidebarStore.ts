import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

interface SidebarState {
  /** Sidebarの開閉状態 */
  isOpen: boolean;
  /** Sidebarを開く */
  open: () => void;
  /** Sidebarを閉じる */
  close: () => void;
  /** Sidebarの開閉をトグル */
  toggle: () => void;
}

/**
 * Sidebar開閉状態を管理するStore
 *
 * @example
 * ```tsx
 * // ✅ 推奨: auto-generated selectors（再レンダリング最適化）
 * const isOpen = useSidebarStore.use.isOpen()
 * const toggle = useSidebarStore.use.toggle()
 *
 * // ✅ OK: 手動selector
 * const isOpen = useSidebarStore((state) => state.isOpen)
 *
 * // ❌ 非推奨: 全プロパティ取得（不要な再レンダリングが発生）
 * const { isOpen, toggle } = useSidebarStore()
 * ```
 */
const useSidebarStoreBase = create<SidebarState>()(
  devtools(
    persist(
      (set) => ({
        isOpen: true, // デフォルトは開いた状態
        open: () => set({ isOpen: true }),
        close: () => set({ isOpen: false }),
        toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      }),
      {
        name: 'sidebar-storage', // localStorage key
        version: 1,
      },
    ),
    {
      name: 'sidebar-store',
    },
  ),
);

// Auto-generated selectors でパフォーマンス最適化
export const useSidebarStore = createSelectors(useSidebarStoreBase);
