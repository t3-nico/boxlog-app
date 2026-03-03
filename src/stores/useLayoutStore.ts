'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

/**
 * アサイドの種類
 */
export type AsideType = 'none' | 'entries' | 'chat' | 'reflection';

/** アサイドのデフォルト幅（%） */
const DEFAULT_ASIDE_SIZE = 28;

interface LayoutStoreState {
  // ── Sidebar ──
  /** Sidebarの開閉状態 */
  sidebarOpen: boolean;
  /** Sidebarを開く */
  openSidebar: () => void;
  /** Sidebarを閉じる */
  closeSidebar: () => void;
  /** Sidebarの開閉をトグル */
  toggleSidebar: () => void;

  // ── Aside ──
  /** 現在開いているアサイドの種類 */
  asideType: AsideType;
  /** アサイドの幅（%） */
  asideSize: number;
  /** アサイドを指定の種類に設定 */
  setAside: (aside: AsideType) => void;
  /** アサイドを開く（none以外を指定） */
  openAside: (aside: Exclude<AsideType, 'none'>) => void;
  /** アサイドを閉じる */
  closeAside: () => void;
  /** アサイド幅を更新（リサイズ時） */
  setAsideSize: (size: number) => void;
}

/**
 * レイアウトStore
 *
 * 旧 useSidebarStore + useAppAsideStore を統合。
 * サイドバーの開閉とアサイドパネルの状態を一元管理する。
 *
 * @example
 * ```tsx
 * const sidebarOpen = useLayoutStore.use.sidebarOpen();
 * const toggleSidebar = useLayoutStore.use.toggleSidebar();
 * const asideType = useLayoutStore.use.asideType();
 * const openAside = useLayoutStore.use.openAside();
 * ```
 */
const useLayoutStoreBase = create<LayoutStoreState>()(
  devtools(
    persist(
      (set) => ({
        // ── Sidebar ──
        sidebarOpen: true,
        openSidebar: () => set({ sidebarOpen: true }),
        closeSidebar: () => set({ sidebarOpen: false }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // ── Aside ──
        asideType: 'none',
        asideSize: DEFAULT_ASIDE_SIZE,
        setAside: (aside) => set({ asideType: aside }),
        openAside: (aside) => set({ asideType: aside }),
        closeAside: () => set({ asideType: 'none' }),
        setAsideSize: (size) => set({ asideSize: size }),
      }),
      {
        name: 'layout-storage',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          asideType: state.asideType,
          asideSize: state.asideSize,
        }),
        merge: (persistedState, currentState) => {
          const state = persistedState as Partial<LayoutStoreState> | undefined;
          // 旧ストアからのマイグレーション対応
          // 旧 'plan'/'record' は 'entries' にマイグレーション
          const validAsideTypes = ['none', 'entries', 'chat', 'reflection'];
          const asideType = state?.asideType as string | undefined;
          const asideSize = state?.asideSize;
          return {
            ...currentState,
            sidebarOpen: state?.sidebarOpen ?? currentState.sidebarOpen,
            asideType:
              asideType === 'plan' || asideType === 'record'
                ? 'entries'
                : asideType && validAsideTypes.includes(asideType)
                  ? (asideType as AsideType)
                  : 'none',
            asideSize: asideSize ?? DEFAULT_ASIDE_SIZE,
          };
        },
      },
    ),
    { name: 'layout-store' },
  ),
);

export const useLayoutStore = createSelectors(useLayoutStoreBase);
