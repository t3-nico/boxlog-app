import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createSelectors } from '@/lib/zustand/createSelectors';

import type { PanelType } from '../components/layout/Header/PanelSwitcher';

interface CalendarPanelState {
  /** 現在開いているパネルの種類 */
  panelType: PanelType;
  /** パネルを指定の種類に設定 */
  setPanel: (panel: PanelType) => void;
  /** パネルを開く（none以外を指定） */
  openPanel: (panel: Exclude<PanelType, 'none'>) => void;
  /** パネルを閉じる */
  closePanel: () => void;
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
        setPanel: (panel) => set({ panelType: panel }),
        openPanel: (panel) => set({ panelType: panel }),
        closePanel: () => set({ panelType: 'none' }),
      }),
      {
        name: 'calendar-panel-storage',
      },
    ),
    {
      name: 'calendar-panel-store',
    },
  ),
);

export const useCalendarPanelStore = createSelectors(useCalendarPanelStoreBase);
