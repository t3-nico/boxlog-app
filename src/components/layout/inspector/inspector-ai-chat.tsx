'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  ArrowUpCircle, 
  Sparkles, 
  MoreVertical, 
  Trash2, 
  Copy
} from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'

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
      <div className="flex-shrink-0 p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">
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
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1">
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
                    const exportMessages = state.messages.map(msg => ({
                      sender: msg.sender,
                      content: msg.content,
                      timestamp: msg.timestamp
                    }))
                    navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
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
        </div>
      </div>

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
            <p className="text-muted-foreground max-w-md text-sm">
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