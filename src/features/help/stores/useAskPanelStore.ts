// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
import { StoreFactory } from '@/lib/store-factory'

export interface AskPanelState {
  // UI状態
  isOpen: boolean // パネルが表示されているかどうか（常にtrue、モバイルではfalse可能）
  collapsed: boolean // 折りたたみ状態（true: アイコンのみ、false: 全体表示）
  width: number // 展開時のパネル幅（デフォルト: 384px = w-96）
  collapsedWidth: number // 折りたたみ時の幅（デフォルト: 64px = w-16）
  
  // 設定
  preferences: {
    autoOpen: boolean // 特定条件で自動開放
    showInHeader: boolean // ヘッダーにボタンを表示
    defaultPrompts: string[] // デフォルトプロンプト集
  }
}

export interface AskPanelActions {
  // 基本操作
  open: () => void
  close: () => void
  toggle: () => void
  
  // 折りたたみ操作
  collapse: () => void
  expand: () => void
  toggleCollapsed: () => void
  
  // 設定操作
  setWidth: (width: number) => void
  updatePreferences: (preferences: Partial<AskPanelState['preferences']>) => void
}

export type AskPanelStore = AskPanelState & AskPanelActions

// 初期状態
const initialState: AskPanelState = {
  isOpen: false, // 初期状態は非表示
  collapsed: false, // 開いたときは展開状態
  width: 256, // w-64 equivalent (展開時) - 左サイドメニューと完全に同じ幅
  collapsedWidth: 64, // w-16 equivalent (折りたたみ時) - 左サイドメニューと完全に同じ幅
  
  preferences: {
    autoOpen: false,
    showInHeader: false, // ヘッダーボタンは非表示
    defaultPrompts: [
      "Analyze my productivity patterns",
      "What tasks should I focus on today?",
      "Help me organize my schedule",
      "Show me my upcoming deadlines"
    ]
  }
}

export const useAskPanelStore = StoreFactory.createPersisted({
  type: 'persisted',
  name: 'ask-panel-store',
  initialState,
  persist: {
    name: 'ask-panel-store',
    storage: 'localStorage',
    partialize: (state: AskPanelState & AskPanelActions) => ({
      isOpen: state.isOpen,
      collapsed: state.collapsed,
      width: state.width,
      collapsedWidth: state.collapsedWidth,
      preferences: state.preferences,
    }),
  },
  devtools: true,
  actions: (set, _get) => ({
    // 基本操作
    open: () => set({ isOpen: true }),

    close: () => set({ isOpen: false }),

    toggle: () => set((state) => ({
      isOpen: !state.isOpen,
      // 開くときは展開状態にする
      collapsed: state.isOpen ? state.collapsed : false
    })),

    // 折りたたみ操作
    collapse: () => set({ collapsed: true }),

    expand: () => set({ collapsed: false }),

    toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),

    // 設定操作
    setWidth: (width: number) =>
      set({ width: Math.max(256, Math.min(640, width)) }), // 最小256px（サイドメニューと同じ）、最大640px

    updatePreferences: (preferences: Partial<AskPanelState['preferences']>) =>
      set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
  }),
})

// セレクター関数（パフォーマンス最適化用）
export const askPanelSelectors = {
  // UI状態
  getIsOpen: (state: AskPanelStore) => state.isOpen,
  getCollapsed: (state: AskPanelStore) => state.collapsed,
  getWidth: (state: AskPanelStore) => state.width,
  getCollapsedWidth: (state: AskPanelStore) => state.collapsedWidth,
  getCurrentWidth: (state: AskPanelStore) => state.collapsed ? state.collapsedWidth : state.width,
  
  // 設定
  getPreferences: (state: AskPanelStore) => state.preferences,
  getShowInHeader: (state: AskPanelStore) => state.preferences.showInHeader,
  getDefaultPrompts: (state: AskPanelStore) => state.preferences.defaultPrompts,
}