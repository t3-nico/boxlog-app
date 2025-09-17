'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface ChatState {
  isOpen: boolean
  messages: ChatMessage[]
  unreadCount: number
  isTyping: boolean
  inputValue: string
}

interface ChatContextValue {
  // State
  state: ChatState
  
  // Actions
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
  markAsRead: () => void
  setInputValue: (value: string) => void
  clearMessages: () => void
  editMessage: (id: string, newContent: string) => void
  
  // Keyboard shortcuts
  registerShortcuts: () => void
  unregisterShortcuts: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    unreadCount: 0,
    isTyping: false,
    inputValue: ''
  })

  // チャットの開閉
  const toggleChat = useCallback(() => {
    setState(prev => {
      const newIsOpen = !prev.isOpen
      return {
        ...prev,
        isOpen: newIsOpen,
        unreadCount: newIsOpen ? 0 : prev.unreadCount // 開いたら未読をクリア
      }
    })
  }, [])

  const openChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      unreadCount: 0
    }))
  }, [])

  const closeChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  // メッセージ送信
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    }

    // ユーザーメッセージを追加
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputValue: '',
      isTyping: true
    }))

    try {
      // メッセージ送信状態を更新
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' } 
            : msg
        )
      }))

      // API implementation tracked in Issue #87
      await new Promise(resolve => setTimeout(resolve, 1000))

      // アシスタントの返信をシミュレート
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `This is a simulated response to: "${content}"`,
        sender: 'assistant',
        timestamp: new Date()
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        unreadCount: prev.isOpen ? 0 : prev.unreadCount + 1
      }))

    } catch (error) {
      console.error('Failed to send message:', error)
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' } 
            : msg
        ),
        isTyping: false
      }))
    }
  }, [])

  // 未読メッセージを既読にする
  const markAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: 0
    }))
  }, [])

  // 入力値の更新
  const setInputValue = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      inputValue: value
    }))
  }, [])

  // メッセージクリア
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      unreadCount: 0
    }))
  }, [])

  // メッセージ編集
  const editMessage = useCallback((id: string, newContent: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === id 
          ? { ...msg, content: newContent.trim() }
          : msg
      )
    }))
  }, [])

  // キーボードショートカット
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // ⌘/ または Ctrl+/ でチャットをトグル
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault()
      toggleChat()
    }
    
    // Escape でチャットを閉じる
    if (e.key === 'Escape' && state.isOpen) {
      e.preventDefault()
      closeChat()
    }
  }, [toggleChat, closeChat, state.isOpen])

  const registerShortcuts = useCallback(() => {
    document.addEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const unregisterShortcuts = useCallback(() => {
    document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ショートカットの登録/解除
  useEffect(() => {
    registerShortcuts()
    return unregisterShortcuts
  }, [registerShortcuts, unregisterShortcuts])

  const contextValue: ChatContextValue = {
    state,
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    markAsRead,
    setInputValue,
    clearMessages,
    editMessage,
    registerShortcuts,
    unregisterShortcuts
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

export type { ChatMessage, ChatState }