'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  X, 
  ArrowUpCircle, 
  Sparkles, 
  MoreVertical, 
  Trash2, 
  Copy,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'
import { useAIPanel } from '@/contexts/ai-panel-context'

interface BottomUpChatModalProps {
  isOpen: boolean
  onClose: () => void
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user'
  
  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] break-words">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
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
    <div className="mb-4 flex justify-start items-start gap-3">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* AI Message Bubble */}
      <div className="bg-background text-foreground rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] break-words border border-border">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
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
    <div className="flex-shrink-0 p-4 border-t border-border bg-background">
      {/* Typing indicator */}
      {state.isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 max-h-32 min-h-[44px] placeholder-muted-foreground"
            disabled={state.isTyping}
            rows={1}
          />
          
          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className="absolute right-2 bottom-2 p-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors focus:outline-none"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

export function BottomUpChatModal({ isOpen, onClose }: BottomUpChatModalProps) {
  const { state, clearMessages } = useChatContext()
  const { 
    panelHeight, 
    isMinimized, 
    setPanelHeight, 
    setIsMinimized 
  } = useAIPanel()
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
        className="absolute bottom-0 left-0 right-0 bg-background border-t border-border z-50 transition-all duration-300 ease-out flex flex-col shadow-lg"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          height: isMinimized ? '40px' : `${panelHeight}px`,
        }}
      >
        {/* Resize Handle - Hidden when minimized */}
        {!isMinimized && (
          <div
            className="w-full h-2 bg-border/20 hover:bg-primary/20 cursor-ns-resize transition-colors flex items-center justify-center group"
            onMouseDown={handleResizeStart}
          >
            <div className="w-12 h-1 bg-border group-hover:bg-primary/40 rounded-full transition-colors" />
          </div>
        )}
        
        {/* Header or Minimized Bar */}
        {isMinimized ? (
          <div className="flex-1 flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="p-1 h-6 w-6"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 p-4 border-b border-border bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about your tasks and productivity
                  </p>
                </div>
              </div>
            
              <div className="flex items-center gap-1">
                {/* Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  
                  {showMenu && (
                    <div className="absolute right-0 bottom-full mb-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                      <button
                        onClick={() => {
                          clearMessages()
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-accent/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear conversation
                      </button>
                      <button
                        onClick={() => {
                          // Export functionality
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-accent/50 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Export conversation
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Minimize/Maximize */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
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
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Hi! I'm your AI assistant
                  </h3>
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