import { create } from 'zustand'

import type { InspectorDisplayMode } from '@/features/inspector'

interface AIInspectorState {
  /** Inspectorが開いているか */
  isOpen: boolean
  /** 表示モード */
  displayMode: InspectorDisplayMode
  /** コンテキスト情報（現在のページやアイテム） */
  context: {
    pageType?: 'inbox' | 'calendar' | 'tags' | 'stats' | 'settings'
    itemId?: string
    itemType?: 'plan' | 'tag'
  } | null
}

interface AIInspectorActions {
  /** Inspectorを開く */
  openInspector: (context?: AIInspectorState['context']) => void
  /** Inspectorを閉じる */
  closeInspector: () => void
  /** 表示モードを切り替える */
  toggleDisplayMode: () => void
  /** コンテキストを更新 */
  setContext: (context: AIInspectorState['context']) => void
}

type AIInspectorStore = AIInspectorState & AIInspectorActions

/**
 * AIInspector Store
 *
 * AI Chatパネルの開閉状態とコンテキスト情報を管理
 */
export const useAIInspectorStore = create<AIInspectorStore>((set) => ({
  // State
  isOpen: false,
  displayMode: 'sheet',
  context: null,

  // Actions
  openInspector: (context) =>
    set({
      isOpen: true,
      context: context ?? null,
    }),

  closeInspector: () =>
    set({
      isOpen: false,
    }),

  toggleDisplayMode: () =>
    set((state) => ({
      displayMode: state.displayMode === 'sheet' ? 'popover' : 'sheet',
    })),

  setContext: (context) =>
    set({
      context,
    }),
}))
