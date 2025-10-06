'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

import {
  ArrowUpCircle,
  Sparkles,
  MoreVertical,
  Trash2,
  Copy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useChatStore, type ChatMessage } from '@/features/aichat/stores/useChatStore'
import { useI18n } from '@/lib/i18n/hooks'
import { cn } from '@/lib/utils'


const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const { t } = useI18n()
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className={cn('my-4 flex justify-end')}>
        <div className={cn(
          'bg-primary text-primary-foreground',
          'rounded-2xl rounded-tr-sm max-w-[80%] break-words p-4'
        )}>
          <div className={cn('text-sm leading-relaxed whitespace-pre-wrap')}>
            {message.content}
          </div>
          {message.status != null && (
            <div className={cn('mt-1 text-xs opacity-75')}>
              {message.status === 'sending' && t('help.messageStatus.sending')}
              {message.status === 'error' && t('aiChat.errors.sendingMessage')}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn('my-4 flex justify-start items-start gap-3')}>
      {/* AI Avatar */}
      <div className={cn(
        'w-8 h-8 flex items-center justify-center flex-shrink-0',
        'rounded-full',
        'bg-gradient-to-br from-primary to-tertiary',
        'text-primary-foreground'
      )}>
        <Sparkles className="w-4 h-4" />
      </div>

      {/* AI Message Bubble */}
      <div className={cn(
        'rounded-2xl rounded-tl-sm max-w-[80%] break-words',
        'bg-card text-card-foreground',
        'border border-border',
        'p-4'
      )}>
        <div className={cn('text-sm leading-relaxed whitespace-pre-wrap')}>
          {message.content}
        </div>
        <div className={cn('mt-1 text-sm text-muted-foreground')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

const ChatInput = () => {
  const { t } = useI18n()
  const { inputValue, isTyping, sendMessage, setInputValue } = useChatStore()
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isTyping) {
      await sendMessage(inputValue)
    }
  }, [inputValue, isTyping, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [isComposing, handleSubmit])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [setInputValue])

  const handleCompositionStart = useCallback(() => setIsComposing(true), [])
  const handleCompositionEnd = useCallback(() => setIsComposing(false), [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const {scrollHeight} = textareaRef.current
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)  }px`
    }
  }, [inputValue])

  return (
    <div className={cn(
      'flex-shrink-0 p-4',
      'border-t border-neutral-200 dark:border-neutral-800',
      'bg-neutral-100 dark:bg-neutral-900'
    )}>
      {/* Typing indicator */}
      {isTyping === true && (
        <div className="flex items-center gap-2 mb-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span>{t('aiChat.status.thinkingAI')}</span>
        </div>
      )}

      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={t('aiChat.input.placeholderAI')}
            className="w-full resize-none rounded-lg border border-neutral-200 dark:border-neutral-800 bg-card p-4 pr-12 text-sm focus:ring-2 focus:ring-primary max-h-32 min-h-[44px] placeholder:text-muted-foreground"
            disabled={isTyping}
            rows={1}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 bottom-2 p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed transition-fast focus:outline-none"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

export const InspectorAIChat = () => {
  const { t } = useI18n()
  const { messages, clearMessages } = useChatStore()
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggleMenu = useCallback(() => setShowMenu(!showMenu), [showMenu])

  const handleClearMessages = useCallback(() => {
    clearMessages()
    setShowMenu(false)
  }, [clearMessages])

  const handleExportMessages = useCallback(() => {
    const exportMessages = messages.map((msg) => ({
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp
    }))
    navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
    setShowMenu(false)
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t('aiChat.assistant')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('aiChat.welcome.description')}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleMenu}
              className="p-1 h-6 w-6"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>

            {showMenu != null && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] p-1">
                <button
                  type="button"
                  onClick={handleClearMessages}
                  className="w-full flex items-center gap-2 p-2 text-sm text-card-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-fast"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('aiChat.menu.clearConversation')}
                </button>
                <button
                  type="button"
                  onClick={handleExportMessages}
                  className="w-full flex items-center gap-2 p-2 text-sm text-card-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-fast"
                >
                  <Copy className="w-4 h-4" />
                  {t('aiChat.menu.exportConversation')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center mx-auto my-4">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              {t('aiChat.welcome.greeting4')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-md text-sm">
              {t('aiChat.welcome.description')}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput />
    </div>
  )
}