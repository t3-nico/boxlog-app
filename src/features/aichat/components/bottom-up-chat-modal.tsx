'use client'

import React, { useEffect, useRef, useState } from 'react'

import { ArrowUpCircle, Copy, Maximize2, Minimize2, MoreVertical, Sparkles, Trash2, X } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { useAIPanel } from '@/contexts/ai-panel-context'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'

interface BottomUpChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[80%] break-words rounded-2xl rounded-tr-sm bg-purple-600 px-4 py-2 text-white">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          {message.status && (
            <div className="mt-1 text-xs text-purple-100 opacity-75">
              {message.status === 'sending' && 'Sending...'}
              {message.status === 'error' && 'Error sending message'}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-start justify-start gap-3">
      {/* AI Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <Sparkles className="h-4 w-4" />
      </div>

      {/* AI Message Bubble */}
      <div className="bg-background text-foreground border-border max-w-[80%] break-words rounded-2xl rounded-tl-sm border px-4 py-2">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

const ChatInput = () => {
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
      const { scrollHeight } = textareaRef.current
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
    }
  }, [state.inputValue])

  return (
    <div className="border-border bg-background flex-shrink-0 border-t p-4">
      {/* Typing indicator */}
      {state.isTyping && (
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.4s' }}></div>
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
            className="border-border bg-card placeholder-muted-foreground max-h-32 min-h-[44px] w-full resize-none rounded-xl border px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
            disabled={state.isTyping}
            rows={1}
          />

          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className="text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 absolute bottom-2 right-2 p-2 transition-colors focus:outline-none disabled:cursor-not-allowed"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

export const BottomUpChatModal = ({ isOpen, onClose }: BottomUpChatModalProps) => {
  const { state, clearMessages } = useChatContext()
  const { panelHeight, isMinimized, setPanelHeight, setIsMinimized } = useAIPanel()
  const [showMenu, setShowMenu] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const resizeStartY = useRef(0)
  const resizeStartHeight = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  // Handle resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    resizeStartY.current = e.clientY
    resizeStartHeight.current = panelHeight
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      // Use window height as reference instead of mainAreaRect
      const windowHeight = window.innerHeight
      const deltaY = resizeStartY.current - e.clientY // Inverted because we want dragging up to increase height
      const newHeight = resizeStartHeight.current + deltaY
      const maxHeight = windowHeight * 0.5 // 50% of window height
      const minHeight = 200 // Minimum height

      const finalHeight = Math.min(Math.max(newHeight, minHeight), maxHeight)
      setPanelHeight(finalHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, setPanelHeight])

  if (!isOpen) return null

  return (
    <>
      {/* Panel positioned within main area */}
      <div
        ref={panelRef}
        className="bg-background border-border absolute bottom-0 left-0 right-0 z-50 flex flex-col border-t shadow-lg transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          height: isMinimized ? '40px' : `${panelHeight}px`,
        }}
      >
        {/* Resize Handle - Hidden when minimized */}
        {!isMinimized && (
          <div
            className="bg-border/20 hover:bg-primary/20 group flex h-2 w-full cursor-ns-resize items-center justify-center transition-colors"
            onMouseDown={handleResizeStart}
            role="button"
            aria-label="Resize chat modal"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                // リサイズモードの開始をキーボードでも可能にする
              }
            }}
          >
            <div className="bg-border group-hover:bg-primary/40 h-1 w-12 rounded-full transition-colors" />
          </div>
        )}

        {/* Header or Minimized Bar */}
        {isMinimized ? (
          <div className="flex flex-1 items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-foreground text-sm font-medium">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)} className="h-6 w-6 p-1">
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-1">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-border bg-background flex-shrink-0 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">AI Assistant</h3>
                  <p className="text-muted-foreground text-sm">Ask me anything about your tasks and productivity</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Menu */}
                <div className="relative">
                  <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)} className="p-2">
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {showMenu && (
                    <div className="bg-card border-border absolute bottom-full right-0 z-50 mb-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          clearMessages()
                          setShowMenu(false)
                        }}
                        className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear conversation
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Export functionality
                          setShowMenu(false)
                        }}
                        className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Export conversation
                      </button>
                    </div>
                  )}
                </div>

                {/* Minimize/Maximize */}
                <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="p-2">
                  <Minimize2 className="h-4 w-4" />
                </Button>

                {/* Close Button */}
                <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Content - Hidden when minimized */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {state.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">Hi! I&apos;m your AI assistant</h3>
                  <p className="text-muted-foreground max-w-md">
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
          </>
        )}
      </div>
    </>
  )
}
