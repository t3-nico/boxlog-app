import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AskPanelState {
  // UI状態
  isOpen: boolean
  collapsed: false // 将来の機能拡張用
  width: number // パネル幅（デフォルト: 384px = w-96）
  
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
  
  // 設定操作
  setWidth: (width: number) => void
  updatePreferences: (preferences: Partial<AskPanelState['preferences']>) => void
}

export type AskPanelStore = AskPanelState & AskPanelActions

// 初期状態
const initialState: AskPanelState = {
  isOpen: false,
  collapsed: false,
  width: 384, // w-96 equivalent
  
  preferences: {
    autoOpen: false,
    showInHeader: true,
    defaultPrompts: [
      "Analyze my productivity patterns",
      "What tasks should I focus on today?",
      "Help me organize my schedule",
      "Show me my upcoming deadlines"
    ]
  }
}

export const useAskPanelStore = create<AskPanelStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 基本操作
      open: () => set({ isOpen: true }),
      
      close: () => set({ isOpen: false }),
      
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      // 設定操作
      setWidth: (width: number) => 
        set({ width: Math.max(320, Math.min(640, width)) }), // 最小320px、最大640px
      
      updatePreferences: (preferences: Partial<AskPanelState['preferences']>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        })),
    }),
    {
      name: 'ask-panel-store',
      partialize: (state) => ({
        isOpen: state.isOpen,
        width: state.width,
        preferences: state.preferences,
      }),
    }
  )
)

// セレクター関数（パフォーマンス最適化用）
export const askPanelSelectors = {
  // UI状態
  getIsOpen: (state: AskPanelStore) => state.isOpen,
  getWidth: (state: AskPanelStore) => state.width,
  
  // 設定
  getPreferences: (state: AskPanelStore) => state.preferences,
  getShowInHeader: (state: AskPanelStore) => state.preferences.showInHeader,
  getDefaultPrompts: (state: AskPanelStore) => state.preferences.defaultPrompts,
}