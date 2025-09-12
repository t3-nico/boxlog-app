'use client'

import React, { useState } from 'react'

import { X, Send, Sparkles, MoreVertical, Plus } from 'lucide-react'

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  
  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // AI応答のシミュレーション
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I received your message: "${  inputValue  }". This is a simulated response.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="w-full bg-background border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-foreground">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              // 新規チャットの処理
              setMessages([{
                id: '1',
                type: 'ai',
                content: 'Hello! I\'m your AI assistant. How can I help you today?',
                timestamp: new Date()
              }])
              setInputValue('') // 入力欄もクリア
            }}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="新規チャット"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="詳細オプション"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/50 rounded-md transition-colors"
            title="閉じる"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-foreground'
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
            placeholder="Ask me anything..."
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="self-end p-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}