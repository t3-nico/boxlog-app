import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

import type { AsideType } from '../components/aside/AsideSwitcher';

/** アサイドのデフォルト幅（%） */
const DEFAULT_ASIDE_SIZE = 28;

interface AppAsideState {
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
 * アプリ共通アサイド状態を管理するStore
 *
 * PC版ではサイドバーのPlan/RecordナビゲーションがこのStoreを通じてアサイドを操作。
 * localStorage に永続化されるため、ページリロード後もアサイド状態が復元される。
 *
 * @example
 * ```tsx
 * // ✅ 推奨: auto-generated selectors
 * const asideType = useAppAsideStore.use.asideType()
 * const openAside = useAppAsideStore.use.openAside()
 *
 * // ✅ OK: 手動selector
 * const asideType = useAppAsideStore((state) => state.asideType)
 * ```
 */
const useAppAsideStoreBase = create<AppAsideState>()(
  devtools(
    persist(
      (set) => ({
        asideType: 'none',
        asideSize: DEFAULT_ASIDE_SIZE,
        setAside: (aside) => set({ asideType: aside }),
        openAside: (aside) => set({ asideType: aside }),
        closeAside: () => set({ asideType: 'none' }),
        setAsideSize: (size) => set({ asideSize: size }),
      }),
      {
        // 後方互換のため旧キーを維持（v0.16.0以前は 'calendar-panel-storage'）
        name: 'calendar-panel-storage',
        // localStorage に不正な値が残っている場合は 'none' にリセット
        merge: (persistedState, currentState) => {
          const state = persistedState as Partial<AppAsideState> | undefined;
          // 旧 panelType / 新 asideType どちらでも復元可能
          const asideType =
            state?.asideType ??
            ((state as Record<string, unknown>)?.panelType as AsideType | undefined);
          const asideSize =
            state?.asideSize ??
            ((state as Record<string, unknown>)?.panelSize as number | undefined);
          const validAsideTypes = ['none', 'plan', 'record', 'chat', 'reflection'];
          return {
            ...currentState,
            ...state,
            asideType: asideType && validAsideTypes.includes(asideType) ? asideType : 'none',
            asideSize: asideSize ?? DEFAULT_ASIDE_SIZE,
          };
        },
      },
    ),
    {
      name: 'app-aside-store',
    },
  ),
);

export const useAppAsideStore = createSelectors(useAppAsideStoreBase);
