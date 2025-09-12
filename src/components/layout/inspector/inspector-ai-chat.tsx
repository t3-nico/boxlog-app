'use client'

import React, { useState, useRef, useEffect } from 'react'

import { Button } from '@/components/shadcn-ui/button'
import { colors, typography, spacing, rounded, animations } from '@/config/theme'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'

import { 
  ArrowUpCircle, 
  Sparkles, 
  MoreVertical, 
  Trash2, 
  Copy
} from 'lucide-react'

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user'
  
  if (isUser) {
    return (
      <div className={`${spacing.margin.md} flex justify-end`}>
        <div className={`${colors.primary.DEFAULT} ${colors.text.onPrimary} rounded-2xl rounded-tr-sm ${spacing.padding.md} max-w-[80%] break-words`}>
          <div className={`${typography.body.sm} leading-relaxed whitespace-pre-wrap`}>
            {message.content}
          </div>
          {message.status && (
            <div className={`${spacing.margin.xs} ${typography.body.xs} ${colors.text.onPrimary} opacity-75`}>
              {message.status === 'sending' && 'Sending...'}
              {message.status === 'error' && 'Error sending message'}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className={`${spacing.margin.md} flex justify-start items-start gap-3`}>
      {/* AI Avatar */}
      <div className={`w-8 h-8 ${rounded.full} ${colors.gradient.primaryTertiary} flex items-center justify-center ${colors.text.onPrimary} flex-shrink-0`}>
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* AI Message Bubble */}
      <div className={`${colors.background.card} ${colors.text.primary} rounded-2xl rounded-tl-sm ${spacing.padding.md} max-w-[80%] break-words ${colors.border.default}`}>
        <div className={`${typography.body.sm} leading-relaxed whitespace-pre-wrap`}>
          {message.content}
        </div>
        <div className={`${spacing.margin.xs} ${typography.body.small} ${colors.text.muted}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function ChatInput() {
  const { state, sendMessage, setInputValue } = useChatContext()
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.inputValue.trim() && !state.isTyping) {
      await sendMessage(state.inputValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px'
    }
  }, [state.inputValue])

  return (
    <div className={`flex-shrink-0 ${spacing.padding.md} ${colors.border.top} ${colors.background.base}`}>
      {/* Typing indicator */}
      {state.isTyping && (
        <div className={`flex items-center gap-2 ${spacing.margin.sm} ${typography.body.sm} ${colors.text.muted}`}>
          <div className="flex gap-1">
            <div className={`w-2 h-2 ${colors.primary.light} ${rounded.full} animate-pulse`}></div>
            <div className={`w-2 h-2 ${colors.primary.light} ${rounded.full} animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-2 h-2 ${colors.primary.light} ${rounded.full} animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span>AI is thinking...</span>
        </div>
      )}
      
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={state.inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Ask AI anything..."
            className={`w-full resize-none ${rounded.component.input.lg} ${colors.border.default} ${colors.background.card} ${spacing.padding.md} pr-12 ${typography.body.sm} ${colors.focus.ring} max-h-32 min-h-[44px] ${colors.placeholder.muted}`}
            disabled={state.isTyping}
            rows={1}
          />
          
          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className={`absolute right-2 bottom-2 ${spacing.padding.xs} ${colors.text.muted} ${colors.hover.text} disabled:${colors.text.disabled} disabled:cursor-not-allowed ${animations.transition.fast} focus:outline-none`}
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

export function InspectorAIChat() {
  const { state, clearMessages } = useChatContext()
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex-shrink-0 ${spacing.padding.md} ${colors.border.bottom} ${colors.background.base}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${rounded.full} ${colors.gradient.primaryTertiary} flex items-center justify-center`}>
              <Sparkles className={`w-4 h-4 ${colors.text.onPrimary}`} />
            </div>
            <div>
              <h3 className={`${typography.body.sm} ${typography.weight.semibold} ${colors.text.primary}`}>AI Assistant</h3>
              <p className={`${typography.body.small} ${colors.text.muted}`}>
                Ask me anything about your tasks
              </p>
            </div>
          </div>
        
          {/* Menu */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 h-6 w-6"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
            
            {showMenu && (
              <div className={`absolute right-0 top-full ${spacing.margin.xs} ${colors.background.card} ${colors.border.default} ${rounded.component.card.lg} shadow-lg z-50 min-w-[140px] ${spacing.padding.xs}`}>
                <button
                  onClick={() => {
                    clearMessages()
                    setShowMenu(false)
                  }}
                  className={`w-full flex items-center gap-2 ${spacing.padding.sm} ${typography.body.sm} text-card-foreground ${colors.hover.subtle} ${animations.transition.fast}`}
                >
                  <Trash2 className="w-4 h-4" />
                  Clear conversation
                </button>
                <button
                  onClick={() => {
                    // Export functionality
                    const exportMessages = state.messages.map(msg => ({
                      sender: msg.sender,
                      content: msg.content,
                      timestamp: msg.timestamp
                    }))
                    navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
                    setShowMenu(false)
                  }}
                  className={`w-full flex items-center gap-2 ${spacing.padding.sm} ${typography.body.sm} text-card-foreground ${colors.hover.subtle} ${animations.transition.fast}`}
                >
                  <Copy className="w-4 h-4" />
                  Export conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto ${spacing.padding.md}`}>
        {state.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-16 h-16 ${rounded.full} ${colors.gradient.primaryTertiary} flex items-center justify-center mx-auto ${spacing.margin.md}`}>
              <Sparkles className={`w-8 h-8 ${colors.text.onPrimary}`} />
            </div>
            <h3 className={`${typography.heading.h3} ${typography.weight.semibold} ${colors.text.primary} ${spacing.margin.xs}`}>
              Hi! I&apos;m your AI assistant
            </h3>
            <p className={`${colors.text.muted} max-w-md ${typography.body.sm}`}>
              I can help you with productivity insights, task management, and answer questions about BoxLog.
            </p>
          </div>
        ) : (
          <>
            {state.messages.map((message) => (
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