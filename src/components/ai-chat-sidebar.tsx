'use client'

import * as React from "react"

// Speech Recognition API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { useState, useEffect } from 'react'
import { 
  X,
  ArrowUpCircle,
  Sparkles,
  Trash2,
  Copy,
  MoreVertical,
  Mic,
  MicOff
} from 'lucide-react'
import { useChatContext } from '@/contexts/chat-context'
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputSubmit,
  AIInputButton,
  AIInputTools,
  AIInputModelSelect,
  AIInputModelSelectTrigger,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectValue
} from '@/components/ui/kibo-ui/ai/input'
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton
} from '@/components/ui/kibo-ui/ai/conversation'
import {
  AIMessage,
  AIMessageContent,
  AIMessageAvatar
} from '@/components/ui/kibo-ui/ai/message'
import { AIResponse } from '@/components/ui/kibo-ui/ai/response'
import {
  AIBranch,
  AIBranchMessages,
  AIBranchSelector,
  AIBranchPrevious,
  AIBranchNext,
  AIBranchPage
} from '@/components/ui/kibo-ui/ai/branch'

// BoxLog用のカスタムAI Responseコンポーネント
const BoxLogAIResponse = ({ children, ...props }: { children: string; [key: string]: any }) => (
  <AIResponse
    className="prose prose-sm dark:prose-invert max-w-none
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
      [&_p]:leading-relaxed [&_p]:my-2
      [&_ul]:my-2 [&_ol]:my-2
      [&_li]:my-1
      [&_pre]:bg-muted [&_pre]:rounded
      [&_code]:bg-muted [&_code]:px-1 [&_code]:py-1 [&_code]:rounded
      [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
      [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2
      [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
      [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
    options={{
      disallowedElements: ['script', 'iframe'],
      remarkPlugins: [],
    }}
    {...props}
  >
    {children}
  </AIResponse>
)

interface AIChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MessageBubbleProps {
  message: {
    id: string
    content: string | string[]  // 複数の分岐レスポンスをサポート
    sender: 'user' | 'assistant'
    timestamp: Date
    status?: 'sending' | 'error' | 'sent'
  }
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  const isAssistant = message.sender === 'assistant'
  
  // 分岐レスポンス（配列）かどうかチェック
  const hasBranches = isAssistant && Array.isArray(message.content) && message.content.length > 1
  
  return (
    <AIMessage from={message.sender}>
      {isAssistant && (
        <div className="size-8 inline-grid shrink-0 align-middle rounded-full outline -outline-offset-1 outline-black/10 dark:outline-white/10 bg-muted flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-foreground" />
        </div>
      )}
      
      <AIMessageContent>
        {isAssistant && hasBranches ? (
          // 複数の分岐レスポンスがある場合
          <AIBranch onBranchChange={(index) => console.log('Branch changed to:', index)}>
            <AIBranchMessages>
              {(message.content as string[]).map((content, index) => (
                <BoxLogAIResponse key={index}>
                  {content}
                </BoxLogAIResponse>
              ))}
            </AIBranchMessages>
            <AIBranchSelector from="assistant">
              <AIBranchPrevious />
              <AIBranchPage />
              <AIBranchNext />
            </AIBranchSelector>
          </AIBranch>
        ) : isAssistant ? (
          // 単一のレスポンスの場合
          <BoxLogAIResponse>
            {Array.isArray(message.content) ? message.content[0] : message.content}
          </BoxLogAIResponse>
        ) : (
          // ユーザーメッセージの場合
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content as string}
            {message.status && (
              <div className="mt-1 text-xs opacity-75">
                {message.status === 'sending' && 'Sending...'}
                {message.status === 'error' && 'Send Error'}
                {message.status === 'sent' && 'Sent'}
              </div>
            )}
          </div>
        )}
        
        {isAssistant && (
          <div className="mt-1 text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </AIMessageContent>
      
      {isUser && (
        <AIMessageAvatar 
          src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'/%3e%3c/svg%3e"
          name="You"
        />
      )}
    </AIMessage>
  )
}

function ChatInput() {
  const { state, sendMessage, setInputValue } = useChatContext()
  const [isComposing, setIsComposing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-3-sonnet')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.inputValue.trim() && !state.isTyping) {
      await sendMessage(state.inputValue)
    }
  }

  const getSubmitStatus = () => {
    if (state.isTyping) return 'streaming'
    if (!state.inputValue.trim()) return 'ready'
    return 'ready'
  }

  const toggleVoiceInput = () => {
    if (!isListening) {
      // 音声認識開始
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = 'ja-JP'
        
        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('')
          
          setInputValue(transcript)
        }
        
        recognition.onerror = () => setIsListening(false)
        recognition.start()
      } else {
        alert('音声認識がサポートされていません')
      }
    } else {
      setIsListening(false)
    }
  }

  return (
    <div className="flex-shrink-0 p-4 bg-background">
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
      
      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea
          value={state.inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Ask Claude..."
          disabled={state.isTyping}
          minHeight={40}
          maxHeight={120}
        />
        <AIInputToolbar>
          <AIInputTools>
            {/* AI Model Selector */}
            <AIInputModelSelect value={selectedModel} onValueChange={setSelectedModel}>
              <AIInputModelSelectTrigger className="w-auto min-w-[120px]">
                <AIInputModelSelectValue />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent>
                <AIInputModelSelectItem value="claude-3-sonnet">Claude 3 Sonnet</AIInputModelSelectItem>
                <AIInputModelSelectItem value="claude-3-haiku">Claude 3 Haiku</AIInputModelSelectItem>
                <AIInputModelSelectItem value="claude-3-opus">Claude 3 Opus</AIInputModelSelectItem>
              </AIInputModelSelectContent>
            </AIInputModelSelect>
            
            {/* Voice Input Button */}
            <AIInputButton
              onClick={toggleVoiceInput}
              variant={isListening ? "default" : "ghost"}
              className={isListening ? "text-red-600 bg-red-50 dark:bg-red-950" : ""}
              title={isListening ? "音声入力を停止" : "音声入力を開始"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </AIInputButton>
          </AIInputTools>
          
          <AIInputSubmit
            disabled={!state.inputValue.trim() || state.isTyping}
            status={getSubmitStatus()}
          />
        </AIInputToolbar>
      </AIInput>
    </div>
  )
}

export function AIChatSidebar({ isOpen, onClose }: AIChatSidebarProps) {
  const { state, clearMessages } = useChatContext()
  const [showMenu, setShowMenu] = useState(false)

  if (!isOpen) return null

  return (
    <div 
      className="fixed right-0 bg-background border-l border-border z-50 flex flex-col"
      style={{ 
        top: '64px',
        width: '320px',
        bottom: '0'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-background h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors"
                aria-label="Menu options"
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
                    Clear chat
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(state.messages))
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-card-foreground hover:bg-accent/50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Export chat
                  </button>
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors"
              aria-label="Close AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <AIConversation>
        <AIConversationContent>
          {state.messages.length === 0 ? (
            <AIMessage from="assistant">
              <div className="size-8 inline-grid shrink-0 align-middle rounded-full outline -outline-offset-1 outline-black/10 dark:outline-white/10 bg-muted flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-foreground" />
              </div>
              <AIMessageContent>
                <AIBranch>
                  <AIBranchMessages>
                    <BoxLogAIResponse>
                      Hi! I'm **Claude**, your AI assistant. I can help you with:
                      
                      • **Task planning and organization**
                      • **Answering questions**  
                      • **Code assistance**
                      • **Writing and analysis**
                      
                      What would you like to know?
                    </BoxLogAIResponse>
                    <BoxLogAIResponse>
                      Welcome to **BoxLog**! I'm Claude, your AI assistant. 
                      
                      I'm here to help you:
                      
                      • **Organize your tasks** and projects
                      • **Answer any questions** you might have
                      • **Assist with coding** and technical issues
                      • **Help with writing** and analysis
                      
                      How can I assist you today?
                    </BoxLogAIResponse>
                    <BoxLogAIResponse>
                      Hello! I'm **Claude**, ready to help you with BoxLog.
                      
                      My capabilities include:
                      
                      • **Smart task management** suggestions
                      • **Quick answers** to your questions
                      • **Code assistance** and debugging
                      • **Content creation** and analysis
                      
                      What would you like to work on?
                    </BoxLogAIResponse>
                  </AIBranchMessages>
                  <AIBranchSelector from="assistant">
                    <AIBranchPrevious />
                    <AIBranchPage />
                    <AIBranchNext />
                  </AIBranchSelector>
                </AIBranch>
              </AIMessageContent>
            </AIMessage>
          ) : (
            state.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      
      {/* Chat Input */}
      <ChatInput />
    </div>
  )
}