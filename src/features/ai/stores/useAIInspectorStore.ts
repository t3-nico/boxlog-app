import { create } from 'zustand';

interface AIInspectorState {
  /** Inspectorが開いているか */
  isOpen: boolean;
  /** コンテキスト情報（現在のページやアイテム） */
  context: {
    pageType?: 'inbox' | 'calendar' | 'tags' | 'stats' | 'settings';
    itemId?: string;
    itemType?: 'plan' | 'tag';
  } | null;
}

interface AIInspectorActions {
  /** Inspectorを開く */
  openInspector: (context?: AIInspectorState['context']) => void;
  /** Inspectorを閉じる */
  closeInspector: () => void;
  /** コンテキストを更新 */
  setContext: (context: AIInspectorState['context']) => void;
}

type AIInspectorStore = AIInspectorState & AIInspectorActions;

/**
 * AIInspector Store
 *
 * AI Chatパネルの開閉状態とコンテキスト情報を管理
 */
export const useAIInspectorStore = create<AIInspectorStore>((set) => ({
  // State
  isOpen: false,
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

  setContext: (context) =>
    set({
      context,
    }),
}));
