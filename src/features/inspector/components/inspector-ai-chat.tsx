'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowUpCircle, Copy, MoreVertical, Sparkles, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useChatStore, type ChatMessage } from '@/features/aichat/stores/useChatStore'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const { t } = useI18n()
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className={cn('my-4 flex justify-end')}>
        <div
          className={cn('bg-primary text-primary-foreground', 'max-w-[80%] rounded-2xl rounded-tr-sm p-4 break-words')}
        >
          <div className={cn('text-sm leading-relaxed whitespace-pre-wrap')}>{message.content}</div>
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
    <div className={cn('my-4 flex items-start justify-start gap-3')}>
      {/* AI Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center',
          'rounded-full',
          'from-primary to-tertiary bg-gradient-to-br',
          'text-primary-foreground'
        )}
      >
        <Sparkles className="h-4 w-4" />
      </div>

      {/* AI Message Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl rounded-tl-sm break-words',
          'bg-card text-card-foreground',
          'border-border border',
          'p-4'
        )}
      >
        <div className={cn('text-sm leading-relaxed whitespace-pre-wrap')}>{message.content}</div>
        <div className={cn('text-muted-foreground mt-1 text-sm')}>
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (inputValue.trim() && !isTyping) {
        await sendMessage(inputValue)
      }
    },
    [inputValue, isTyping, sendMessage]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [isComposing, handleSubmit]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value)
    },
    [setInputValue]
  )

  const handleCompositionStart = useCallback(() => setIsComposing(true), [])
  const handleCompositionEnd = useCallback(() => setIsComposing(false), [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const { scrollHeight } = textareaRef.current
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
    }
  }, [inputValue])

  return (
    <div
      className={cn(
        'flex-shrink-0 p-4',
        'border-t border-neutral-200 dark:border-neutral-800',
        'bg-neutral-100 dark:bg-neutral-900'
      )}
    >
      {/* Typing indicator */}
      {isTyping === true && (
        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex gap-1">
            <div className="bg-primary/60 h-2 w-2 animate-pulse rounded-full"></div>
            <div className="bg-primary/60 h-2 w-2 animate-pulse rounded-full" style={{ animationDelay: '0.2s' }}></div>
            <div className="bg-primary/60 h-2 w-2 animate-pulse rounded-full" style={{ animationDelay: '0.4s' }}></div>
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
            className="bg-card focus:ring-primary placeholder:text-muted-foreground max-h-32 min-h-[44px] w-full resize-none rounded-lg border border-neutral-200 p-4 pr-12 text-sm focus:ring-2 dark:border-neutral-800"
            disabled={isTyping}
            rows={1}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="transition-fast absolute right-2 bottom-2 p-1 text-neutral-600 hover:text-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:text-neutral-400 dark:text-neutral-400 dark:hover:text-neutral-100 dark:disabled:text-neutral-600"
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
      timestamp: msg.timestamp,
    }))
    navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
    setShowMenu(false)
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-primary to-tertiary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br">
              <Sparkles className="text-primary-foreground h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t('aiChat.assistant')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('aiChat.welcome.description')}</p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <Button variant="secondary" size="sm" onClick={toggleMenu} className="h-6 w-6 p-1">
              <MoreVertical className="h-3 w-3" />
            </Button>

            {showMenu != null && (
              <div className="bg-card border-border absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-lg border p-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleClearMessages}
                  className="text-card-foreground transition-fast flex w-full items-center gap-2 p-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('aiChat.menu.clearConversation')}
                </button>
                <button
                  type="button"
                  onClick={handleExportMessages}
                  className="text-card-foreground transition-fast flex w-full items-center gap-2 p-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Copy className="h-4 w-4" />
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
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="from-primary to-tertiary mx-auto my-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
              <Sparkles className="text-primary-foreground h-8 w-8" />
            </div>
            <h3 className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {t('aiChat.welcome.greeting4')}
            </h3>
            <p className="max-w-md text-sm text-neutral-600 dark:text-neutral-400">{t('aiChat.welcome.description')}</p>
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
