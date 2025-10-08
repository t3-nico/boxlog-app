'use client'

import React, { useState } from 'react'

import { MoreVertical, Plus, Send, Sparkles, X } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'

interface AiChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export const AiChatPanel = ({ isOpen, onClose }: AiChatPanelProps) => {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: t('aiChat.greeting'),
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')

  if (!isOpen) return null

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    // AI応答のシミュレーション
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: t('aiChat.simulatedResponse', { message: inputValue }),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-background border-border flex h-full w-full flex-col border-l">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-foreground text-base font-semibold">{t('aiChat.assistant')}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              // 新規チャットの処理
              setMessages([
                {
                  id: '1',
                  type: 'ai',
                  content: t('aiChat.greeting'),
                  timestamp: new Date(),
                },
              ])
              setInputValue('') // 入力欄もクリア
            }}
            className="hover:bg-accent/50 rounded-md p-2 transition-colors"
            title={t('aiChat.newChat')}
          >
            <Plus className="text-muted-foreground h-4 w-4" />
          </button>
          <button
            type="button"
            className="hover:bg-accent/50 rounded-md p-2 transition-colors"
            title={t('aiChat.detailOptions')}
          >
            <MoreVertical className="text-muted-foreground h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-accent/50 rounded-md p-2 transition-colors"
            title={t('aiChat.close')}
          >
            <X className="text-muted-foreground h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('aiChat.input.placeholder')}
            className="border-border bg-background text-foreground placeholder-muted-foreground flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            rows={2}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="self-end rounded-md bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
