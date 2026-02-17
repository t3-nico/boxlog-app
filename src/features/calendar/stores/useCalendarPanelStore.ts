import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

import type { PanelType } from '../components/layout/Header/PanelSwitcher';

/** サイドパネルのデフォルト幅（%） */
const DEFAULT_PANEL_SIZE = 28;

interface CalendarPanelState {
  /** 現在開いているパネルの種類 */
  panelType: PanelType;
  /** サイドパネルの幅（%） */
  panelSize: number;
  /** パネルを指定の種類に設定 */
  setPanel: (panel: PanelType) => void;
  /** パネルを開く（none以外を指定） */
  openPanel: (panel: Exclude<PanelType, 'none'>) => void;
  /** パネルを閉じる */
  closePanel: () => void;
  /** パネル幅を更新（リサイズ時） */
  setPanelSize: (size: number) => void;
}

/**
 * カレンダーサイドパネル状態を管理するStore
 *
 * PC版ではサイドバーのPlan/RecordナビゲーションがこのStoreを通じてパネルを操作。
 * localStorage に永続化されるため、ページリロード後もパネル状態が復元される。
 *
 * @example
 * ```tsx
 * // ✅ 推奨: auto-generated selectors
 * const panelType = useCalendarPanelStore.use.panelType()
 * const openPanel = useCalendarPanelStore.use.openPanel()
 *
 * // ✅ OK: 手動selector
 * const panelType = useCalendarPanelStore((state) => state.panelType)
 * ```
 */
const useCalendarPanelStoreBase = create<CalendarPanelState>()(
  devtools(
    persist(
      (set) => ({
        panelType: 'none',
        panelSize: DEFAULT_PANEL_SIZE,
        setPanel: (panel) => set({ panelType: panel }),
        openPanel: (panel) => set({ panelType: panel }),
        closePanel: () => set({ panelType: 'none' }),
        setPanelSize: (size) => set({ panelSize: size }),
      }),
      {
        name: 'calendar-panel-storage',
        // 'stats' パネルタイプが削除されたため、localStorage に残っている場合は 'none' にリセット
        merge: (persistedState, currentState) => {
          const state = persistedState as Partial<CalendarPanelState> | undefined;
          const panelType = state?.panelType;
          const validPanelTypes = ['none', 'plan', 'record', 'chat'];
          return {
            ...currentState,
            ...state,
            panelType: panelType && validPanelTypes.includes(panelType) ? panelType : 'none',
          };
        },
      },
    ),
    {
      name: 'calendar-panel-store',
    },
  ),
);

export const useCalendarPanelStore = createSelectors(useCalendarPanelStoreBase);
