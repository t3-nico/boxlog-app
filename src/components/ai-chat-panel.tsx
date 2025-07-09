'use client'

import React, { useState } from 'react'
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon, EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/button'

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

export function AiChatPanel({ isOpen, onClose }: AiChatPanelProps) {
  if (!isOpen) return null;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')

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
        content: 'I received your message: "' + inputValue + '". This is a simulated response.',
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
    <div className="w-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-0.5">
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
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="新規チャット"
          >
            <PlusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="詳細オプション"
          >
            <EllipsisVerticalIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="閉じる"
          >
            <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
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
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            variant="outline"
            size="sm"
            className="self-end bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}