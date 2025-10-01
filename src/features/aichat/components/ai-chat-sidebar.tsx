'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'

// Speech Recognition API types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
    }
    length: number
  }
}

interface SpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

import { Copy, Mic, MicOff, MoreVertical, Sparkles, Trash2, X } from 'lucide-react'

import {
  AIBranch,
  AIBranchMessages,
  AIBranchNext,
  AIBranchPage,
  AIBranchPrevious,
  AIBranchSelector,
} from '@/components/kibo-ui/ai/branch'
import { AIConversation, AIConversationContent, AIConversationScrollButton } from '@/components/kibo-ui/ai/conversation'
import {
  AIInput,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/kibo-ui/ai/input'
import { AIMessage, AIMessageAvatar, AIMessageContent } from '@/components/kibo-ui/ai/message'
import { AIResponse } from '@/components/kibo-ui/ai/response'
import { useChatContext } from '@/contexts/chat-context'

// BoxLog用のカスタムAI Responseコンポーネント
const BoxLogAIResponse = ({ children, ...props }: { children: string; [key: string]: unknown }) => (
  <AIResponse
    className="prose prose-sm dark:prose-invert [&_pre]:bg-muted [&_code]:bg-muted max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:px-1 [&_code]:py-1 [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_p]:leading-relaxed [&_pre]:rounded [&_ul]:my-2"
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
  isMainView?: boolean
}

interface MessageBubbleProps {
  message: {
    id: string
    content: string | string[] // 複数の分岐レスポンスをサポート
    sender: 'user' | 'assistant'
    timestamp: Date
    status?: 'sending' | 'error' | 'sent'
  }
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.sender === 'user'
  const isAssistant = message.sender === 'assistant'

  // 分岐レスポンス（配列）かどうかチェック
  const hasBranches = isAssistant && Array.isArray(message.content) && message.content.length > 1

  return (
    <AIMessage from={message.sender}>
      {isAssistant === true && (
        <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
          <Sparkles className="text-foreground h-4 w-4" />
        </div>
      )}

      <AIMessageContent>
        {isAssistant && hasBranches ? (
          // 複数の分岐レスポンスがある場合
          <AIBranch onBranchChange={createBranchChangeHandler(0)}>
            <AIBranchMessages>
              {(message.content as string[]).map((content, _index) => (
                <BoxLogAIResponse key={`${message.id}-${content.slice(0, 30)}`}>{content}</BoxLogAIResponse>
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
          <BoxLogAIResponse>{Array.isArray(message.content) ? message.content[0] : message.content}</BoxLogAIResponse>
        ) : (
          // ユーザーメッセージの場合
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content as string}
            {message.status != null && (
              <div className="mt-1 text-xs opacity-75">
                {message.status === 'sending' && 'Sending...'}
                {message.status === 'error' && 'Send Error'}
                {message.status === 'sent' && 'Sent'}
              </div>
            )}
          </div>
        )}

        {isAssistant === true && (
          <div className="mt-1 text-xs opacity-60">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </AIMessageContent>

      {isUser === true && (
        <AIMessageAvatar
          src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'/%3e%3c/svg%3e"
          name="You"
        />
      )}
    </AIMessage>
  )
}

const ChatInput = () => {
  const { state, sendMessage, setInputValue } = useChatContext()
  const [_isComposing, _setIsComposing] = useState(false)
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

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
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
    <div className="bg-background flex-shrink-0 p-4">
      {/* Typing indicator */}
      {state.isTyping === true && (
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

      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea
          value={state.inputValue}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
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
              variant={isListening ? 'default' : 'ghost'}
              className={isListening ? 'bg-red-50 text-red-600 dark:bg-red-950' : ''}
              title={isListening ? '音声入力を停止' : '音声入力を開始'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </AIInputButton>
          </AIInputTools>

          <AIInputSubmit disabled={!state.inputValue.trim() || state.isTyping} status={getSubmitStatus()} />
        </AIInputToolbar>
      </AIInput>
    </div>
  )
}

export const AIChatSidebar = ({ isOpen, onClose, isMainView = false }: AIChatSidebarProps) => {
  const { state, clearMessages } = useChatContext()

  const handleMenuToggle = useCallback(() => {
    setShowMenu(!showMenu)
  }, [showMenu])

  const handleClearMessages = useCallback(() => {
    clearMessages()
    setShowMenu(false)
  }, [clearMessages])

  const handleExportMessages = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(state.messages))
    setShowMenu(false)
  }, [state.messages])
  const [showMenu, setShowMenu] = useState(false)

  if (!isOpen) return null

  return (
    <div
      className={
        isMainView
          ? 'bg-background flex h-full flex-col'
          : 'bg-background border-border fixed right-0 z-50 flex flex-col border-l'
      }
      style={
        isMainView
          ? {}
          : {
              top: '64px',
              width: '320px',
              bottom: '0',
            }
      }
    >
      {/* Header */}
      <div className="bg-background h-16 flex-shrink-0">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-foreground h-6 w-6" />
            <div>
              <h3 className="text-foreground text-sm font-semibold">AI Assistant</h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-1 transition-colors"
                aria-label="Menu options"
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
                    Clear chat
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMessages}
                    className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Export chat
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-1 transition-colors"
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
              <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
                <Sparkles className="text-foreground h-4 w-4" />
              </div>
              <AIMessageContent>
                <AIBranch>
                  <AIBranchMessages>
                    <BoxLogAIResponse>
                      Hi! I&apos;m **Claude**, your AI assistant. I can help you with: • **Task planning and
                      organization** • **Answering questions** • **Code assistance** • **Writing and analysis** What
                      would you like to know?
                    </BoxLogAIResponse>
                    <BoxLogAIResponse>
                      Welcome to **BoxLog**! I&apos;m Claude, your AI assistant. I&apos;m here to help you: • **Organize
                      your tasks** and projects • **Answer any questions** you might have • **Assist with coding** and
                      technical issues • **Help with writing** and analysis How can I assist you today?
                    </BoxLogAIResponse>
                    <BoxLogAIResponse>
                      Hello! I&apos;m **Claude**, ready to help you with BoxLog. My capabilities include: • **Smart task
                      management** suggestions • **Quick answers** to your questions • **Code assistance** and debugging
                      • **Content creation** and analysis What would you like to work on?
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
            state.messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      {/* Chat Input */}
      <ChatInput />
    </div>
  )
}
