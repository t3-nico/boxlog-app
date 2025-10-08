import { create } from 'zustand'

export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface ChatStore {
  isOpen: boolean
  messages: ChatMessage[]
  unreadCount: number
  isTyping: boolean
  inputValue: string

  // Actions
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
  markAsRead: () => void
  setInputValue: (value: string) => void
  clearMessages: () => void
  editMessage: (id: string, newContent: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  isOpen: false,
  messages: [],
  unreadCount: 0,
  isTyping: false,
  inputValue: '',

  // チャットの開閉
  toggleChat: () => {
    const { isOpen } = get()
    set({
      isOpen: !isOpen,
      unreadCount: !isOpen ? 0 : get().unreadCount, // 開いたら未読をクリア
    })
  },

  openChat: () => {
    set({
      isOpen: true,
      unreadCount: 0,
    })
  },

  closeChat: () => {
    set({ isOpen: false })
  },

  // メッセージ送信
  sendMessage: async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    }

    // ユーザーメッセージを追加
    set((state) => ({
      messages: [...state.messages, userMessage],
      inputValue: '',
      isTyping: true,
    }))

    try {
      // メッセージ送信状態を更新
      set((state) => ({
        messages: state.messages.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg)),
      }))

      // API implementation tracked in Issue #87
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // アシスタントの返信をシミュレート
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated response to: "${content}"`,
        sender: 'assistant',
        timestamp: new Date(),
      }

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      }))
    } catch (error) {
      console.error('Failed to send message:', error)

      set((state) => ({
        messages: state.messages.map((msg) => (msg.id === userMessage.id ? { ...msg, status: 'error' as const } : msg)),
        isTyping: false,
      }))
    }
  },

  // 未読メッセージを既読にする
  markAsRead: () => {
    set({ unreadCount: 0 })
  },

  // 入力値の更新
  setInputValue: (value: string) => {
    set({ inputValue: value })
  },

  // メッセージクリア
  clearMessages: () => {
    set({
      messages: [],
      unreadCount: 0,
    })
  },

  // メッセージ編集
  editMessage: (id: string, newContent: string) => {
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, content: newContent.trim() } : msg)),
    }))
  },
}))
