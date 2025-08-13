'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ArrowUpCircle,
  Sparkles,
  Trash2,
  Copy,
  MoreVertical,
} from 'lucide-react'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'
import { Button } from '@/components/ui/button'

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  
  if (isUser) {
    return (
      <div className="mb-6 flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] break-words">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          {message.status && (
            <div className="mt-1 text-xs text-blue-100 opacity-75">
              {message.status === 'sending' && 'Sending...'}
              {message.status === 'error' && 'Error sending message'}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="mb-6 flex justify-start items-start gap-3">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* AI Message Bubble */}
      <div className="bg-background text-foreground rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] break-words border border-border">
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
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px'
    }
  }, [state.inputValue])

  return (
    <div className="flex-shrink-0 p-6 border-t border-border bg-background">
      {/* Typing indicator */}
      {state.isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span>Claude is thinking...</span>
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
            placeholder="Ask Claude anything about BoxLog..."
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

function ChatHeader() {
  const { clearMessages } = useChatContext()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex-shrink-0 p-6 border-b border-border bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Claude AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Your AI helper for BoxLog productivity
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
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
                  // Export functionality could be implemented here
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
  )
}

function WelcomeMessage() {
  const { sendMessage } = useChatContext()

  const quickPrompts = [
    { emoji: "🚀", text: "How do I get started with BoxLog?", description: "Basic setup and first steps" },
    { emoji: "📊", text: "Analyze my productivity patterns", description: "Get insights on your work habits" },
    { emoji: "🎯", text: "What tasks should I focus on today?", description: "Prioritize your daily tasks" },
    { emoji: "📅", text: "Help me organize my schedule", description: "Optimize your calendar and time" },
  ]

  return (
    <div className="flex-1 flex flex-col justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Hi! I'm Claude, your BoxLog AI assistant
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            I can help you with productivity insights, task management, scheduling advice, 
            and answer any questions about using BoxLog effectively.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => sendMessage(prompt.text)}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors text-left group"
            >
              <span className="text-2xl">{prompt.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground mb-1">
                  {prompt.text}
                </div>
                <div className="text-xs text-muted-foreground">
                  {prompt.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HelpChat() {
  const { state } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  return (
    <div className="h-full flex flex-col bg-background">
      <ChatHeader />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {state.messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {state.messages.map((message) => (
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