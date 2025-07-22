'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  ArrowUpCircle,
  MoreVertical,
  Trash2,
  Copy,
  Sparkles,
  Pencil,
  Check
} from 'lucide-react'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'
import { Avatar } from '@/components/avatar'

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  const { editMessage } = useChatContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
  }

  const handleSave = () => {
    if (editContent.trim() !== message.content) {
      editMessage(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])
  
  if (isUser) {
    return (
      <div className="mb-6 flex justify-end group">
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] break-words">
            {isEditing ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-white placeholder-blue-200 border-none outline-none resize-none text-sm leading-relaxed"
                  rows={1}
                  style={{ minHeight: '1.5rem' }}
                />
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-500">
                  <button
                    onClick={handleSave}
                    className="p-1 hover:bg-blue-500 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 hover:bg-blue-500 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            )}
            {message.status && !isEditing && (
              <div className="mt-1 text-xs text-blue-100 opacity-75">
                {message.status === 'sending' && '送信中...'}
                {message.status === 'error' && '送信エラー'}
              </div>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="mb-6 flex justify-start items-start gap-3">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        AI
      </div>
      
      {/* AI Message Bubble */}
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] break-words">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
    <div className="flex-shrink-0 p-4">
      {/* Typing indicator */}
      {state.isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
            placeholder="Message Claude..."
            className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 max-h-32 min-h-[44px] placeholder-gray-500 dark:placeholder-gray-400 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            disabled={state.isTyping}
            rows={1}
          />
          
          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none"
          >
            <ArrowUpCircle className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

function ChatHeader() {
  const { closeChat, clearMessages } = useChatContext()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">BoxLog Assistant</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                <button
                  onClick={() => {
                    clearMessages()
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear conversation
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({}))
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Export conversation
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}

export function ChatPanel() {
  const { state, markAsRead } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  // Mark messages as read when panel is open
  useEffect(() => {
    if (state.isOpen && state.unreadCount > 0) {
      markAsRead()
    }
  }, [state.isOpen, state.unreadCount, markAsRead])

  if (!state.isOpen) return null

  return (
    <div className="absolute right-0 top-[3.375rem] bottom-2 lg:right-2 lg:top-[3.375rem] lg:bottom-2 w-full sm:w-80 lg:bg-white dark:lg:bg-zinc-900 border-l border-gray-200 dark:border-gray-700 lg:rounded-r-lg shadow-lg z-40 flex flex-col overflow-hidden">
      <ChatHeader />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {state.messages.length === 0 ? (
          <div className="flex justify-start items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              AI
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <div className="text-sm leading-relaxed">
                Hi! I&rsquo;m Claude, your AI assistant in BoxLog. I can help you with:
              </div>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Analyzing your tasks and productivity patterns</li>
                <li>• Creating and organizing tasks</li>
                <li>• Scheduling and time management</li>
                <li>• Answering questions about your data</li>
              </ul>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                What would you like to know or do today?
              </div>
            </div>
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
      
      <ChatInput />
    </div>
  )
}