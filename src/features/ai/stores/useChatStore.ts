import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ChatStoreState {
  /** 現在の会話ID（null = 新規未保存） */
  activeConversationId: string | null;
  /** 初回読み込み完了フラグ */
  initialized: boolean;
  /** DB保存中フラグ */
  isSaving: boolean;
}

interface ChatStoreActions {
  setActiveConversationId: (id: string | null) => void;
  setInitialized: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  /** 新規会話状態にリセット */
  resetConversation: () => void;
}

type ChatStore = ChatStoreState & ChatStoreActions;

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      activeConversationId: null,
      initialized: false,
      isSaving: false,

      setActiveConversationId: (id) => {
        set({ activeConversationId: id }, false, 'setActiveConversationId');
      },
      setInitialized: (value) => {
        set({ initialized: value }, false, 'setInitialized');
      },
      setIsSaving: (value) => {
        set({ isSaving: value }, false, 'setIsSaving');
      },
      resetConversation: () => {
        set({ activeConversationId: null, isSaving: false }, false, 'resetConversation');
      },
    }),
    { name: 'chat-store' },
  ),
);
