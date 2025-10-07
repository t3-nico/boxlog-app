'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowUpCircle, Copy, MoreVertical, Sparkles, Trash2 } from 'lucide-react'

import { useChatStore, type ChatMessage } from '@/features/aichat/stores/useChatStore'
import { useI18n } from '@/features/i18n/lib/hooks'

interface MessageBubbleProps {
  message: ChatMessage
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { t } = useI18n()
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className="mb-6 flex justify-end">
        <div className="max-w-[85%] break-words rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          {message.status != null && (
            <div className="mt-1 text-xs text-blue-100 opacity-75">
              {message.status === 'sending' && t('help.messageStatus.sending')}
              {message.status === 'error' && t('help.errors.sendingMessage')}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-start justify-start gap-3">
      {/* AI Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-medium text-white">
        <Sparkles className="h-4 w-4" />
      </div>

      {/* AI Message Bubble */}
      <div className="bg-background text-foreground border-border max-w-[85%] break-words rounded-2xl rounded-tl-sm border px-4 py-3">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

const ChatInput = () => {
  const { inputValue, isTyping, sendMessage, setInputValue } = useChatStore()
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // jsx-no-bind optimization: Event handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [setInputValue])

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
  }, [])

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const { scrollHeight } = textareaRef.current
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [inputValue])

  return (
    <div className="border-border bg-background flex-shrink-0 border-t p-6">
      {/* Typing indicator */}
      {isTyping === true && (
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <div className="flex gap-1">
            <div className="bg-muted-foreground/60 h-2 w-2 animate-pulse rounded-full"></div>
            <div
              className="bg-muted-foreground/60 h-2 w-2 animate-pulse rounded-full"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="bg-muted-foreground/60 h-2 w-2 animate-pulse rounded-full"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
          <span>Claude is thinking...</span>
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
            placeholder="Ask Claude anything about BoxLog..."
            className="border-border bg-card placeholder-muted-foreground max-h-32 min-h-[44px] w-full resize-none rounded-xl border px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            disabled={isTyping}
            rows={1}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 absolute bottom-2 right-2 p-2 transition-colors focus:outline-none disabled:cursor-not-allowed"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

const ChatHeader = () => {
  const { clearMessages } = useChatStore()
  const [showMenu, setShowMenu] = useState(false)

  // jsx-no-bind optimization: Menu handlers
  const handleMenuToggle = useCallback(() => {
    setShowMenu(!showMenu)
  }, [showMenu])

  const handleClearMessages = useCallback(() => {
    clearMessages()
    setShowMenu(false)
  }, [clearMessages])

  const handleExportConversation = useCallback(() => {
    // Export functionality could be implemented here
    setShowMenu(false)
  }, [])

  return (
    <div className="border-border bg-background flex-shrink-0 border-b p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">Claude AI Assistant</h3>
            <p className="text-muted-foreground text-sm">Your AI helper for BoxLog productivity</p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={handleMenuToggle}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-2 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu != null && (
            <div className="bg-card border-border absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
              <button
                type="button"
                onClick={handleClearMessages}
                className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear conversation
              </button>
              <button
                type="button"
                onClick={handleExportConversation}
                className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
              >
                <Copy className="h-4 w-4" />
                Export conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const WelcomeMessage = () => {
  const { sendMessage } = useChatStore()
  const { t } = useI18n()

  // jsx-no-bind optimization: Quick prompt handler creator
  const createSendMessageHandler = useCallback((text: string) => {
    return () => sendMessage(text)
  }, [sendMessage])

  const quickPrompts = [
    { emoji: '🚀', text: 'How do I get started with BoxLog?', description: 'Basic setup and first steps' },
    { emoji: '📊', text: t('help.suggestions.analyzeProductivity'), description: t('help.suggestions.analyzeProductivityDesc') },
    { emoji: '🎯', text: t('help.suggestions.focusToday'), description: t('help.suggestions.focusTodayDesc') },
    { emoji: '📅', text: t('help.suggestions.organizeSchedule'), description: t('help.suggestions.organizeScheduleDesc') },
  ]

  return (
    <div className="flex flex-1 flex-col justify-center p-6">
      <div className="mx-auto max-w-2xl text-center">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-foreground mb-4 text-2xl font-semibold">Hi! I&apos;m Claude, your BoxLog AI assistant</h3>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            I can help you with productivity insights, task management, scheduling advice, and answer any questions
            about using BoxLog effectively.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quickPrompts.map((prompt, _index) => (
            <button
              key={`prompt-${prompt.text.slice(0, 20)}`}
              type="button"
              onClick={createSendMessageHandler(prompt.text)}
              className="border-border hover:bg-accent/50 group flex items-center gap-4 rounded-xl border p-4 text-left transition-colors"
            >
              <span className="text-2xl">{prompt.emoji}</span>
              <div className="flex-1">
                <div className="text-foreground mb-1 text-sm font-medium">{prompt.text}</div>
                <div className="text-muted-foreground text-xs">{prompt.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export const HelpChat = () => {
  const { messages } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="bg-background flex h-full flex-col">
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="mx-auto max-w-4xl space-y-6 p-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  )
}
