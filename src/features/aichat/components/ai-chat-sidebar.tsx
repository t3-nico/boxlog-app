// @ts-nocheck TODO(#389): 型エラー3件を段階的に修正する
'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'

import { useI18n } from '@/features/i18n/lib/hooks'

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

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector,
} from '@/components/vercel-ai-elements/branch'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/vercel-ai-elements/conversation'
import { Message, MessageAvatar, MessageContent } from '@/components/vercel-ai-elements/message'
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@/components/vercel-ai-elements/prompt-input'
import { Response } from '@/components/vercel-ai-elements/response'
import { useChatStore } from '@/features/aichat/stores/useChatStore'

// BoxLog用のカスタムAI Responseコンポーネント
const BoxLogAIResponse = ({ children }: { children: string }) => (
  <Response className="prose prose-sm dark:prose-invert [&_pre]:bg-muted [&_code]:bg-muted max-w-none [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:px-1 [&_code]:py-1 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_p]:leading-relaxed [&_pre]:rounded [&_ul]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    {children}
  </Response>
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
    <Message from={message.sender}>
      {isAssistant === true && (
        <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
          <Sparkles className="text-foreground h-4 w-4" />
        </div>
      )}

      <MessageContent>
        {isAssistant && hasBranches ? (
          // 複数の分岐レスポンスがある場合
          <Branch onBranchChange={() => {}}>
            <BranchMessages>
              {(message.content as string[]).map((content, _index) => (
                <BoxLogAIResponse key={`${message.id}-${content.slice(0, 30)}`}>{content}</BoxLogAIResponse>
              ))}
            </BranchMessages>
            <BranchSelector from="assistant">
              <BranchPrevious />
              <BranchPage />
              <BranchNext />
            </BranchSelector>
          </Branch>
        ) : isAssistant ? (
          // 単一のレスポンスの場合
          <BoxLogAIResponse>{Array.isArray(message.content) ? message.content[0] : message.content}</BoxLogAIResponse>
        ) : (
          // ユーザーメッセージの場合
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
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
      </MessageContent>

      {isUser === true && (
        <MessageAvatar
          src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'/%3e%3c/svg%3e"
          name="You"
        />
      )}
    </Message>
  )
}

const ChatInput = () => {
  const { t } = useI18n()
  const { state, sendMessage, setInputValue } = useChatStore()
  const [_isComposing, _setIsComposing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude-3-sonnet')

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value)
    },
    [setInputValue]
  )

  const handleCompositionStart = useCallback(() => {
    _setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    _setIsComposing(false)
  }, [])

  const handleSubmit = async (_message: unknown, event: React.FormEvent) => {
    event.preventDefault()
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
        alert(t('aiChat.voiceRecognition.notSupported'))
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
          <span>{t('aiChat.status.thinking')}</span>
        </div>
      )}

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={state.inputValue}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={t('aiChat.input.placeholderClaude')}
          disabled={state.isTyping}
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-2">
          <div className="flex items-center gap-2">
            {/* AI Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              </SelectContent>
            </Select>

            {/* Voice Input Button */}
            <Button
              onClick={toggleVoiceInput}
              variant={isListening ? 'default' : 'ghost'}
              size="sm"
              className={isListening ? 'h-8 bg-red-50 text-red-600 dark:bg-red-950' : 'h-8'}
              title={isListening ? t('aiChat.voiceRecognition.stop') : t('aiChat.voiceRecognition.start')}
              type="button"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>

          <PromptInputSubmit disabled={!state.inputValue.trim() || state.isTyping} />
        </div>
      </PromptInput>
    </div>
  )
}

export const AIChatSidebar = ({ isOpen, onClose, isMainView = false }: AIChatSidebarProps) => {
  const { t } = useI18n()
  const { state, clearMessages } = useChatStore()

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
              <h3 className="text-foreground text-sm font-semibold">{t('aiChat.assistant')}</h3>
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
                <div className="bg-card border-border absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={handleClearMessages}
                    className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('aiChat.menu.clearChat')}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMessages}
                    className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    {t('aiChat.menu.exportChat')}
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
      <Conversation>
        <ConversationContent>
          {state.messages.length === 0 ? (
            <Message from="assistant">
              <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
                <Sparkles className="text-foreground h-4 w-4" />
              </div>
              <MessageContent>
                <Branch>
                  <BranchMessages>
                    <BoxLogAIResponse>
                      {t('aiChat.welcome.greeting1')}
                      {'\n\n'}• {t('aiChat.welcome.capabilities1.0')}
                      {'\n'}• {t('aiChat.welcome.capabilities1.1')}
                      {'\n'}• {t('aiChat.welcome.capabilities1.2')}
                      {'\n'}• {t('aiChat.welcome.capabilities1.3')}
                      {'\n\n'}
                      {t('aiChat.welcome.question1')}
                    </BoxLogAIResponse>
                    <BoxLogAIResponse>
                      {t('aiChat.welcome.greeting2')}
                      {'\n\n'}• {t('aiChat.welcome.capabilities2.0')}
                      {'\n'}• {t('aiChat.welcome.capabilities2.1')}
                      {'\n'}• {t('aiChat.welcome.capabilities2.2')}
                      {'\n'}• {t('aiChat.welcome.capabilities2.3')}
                      {'\n\n'}
                      {t('aiChat.welcome.question2')}
                    </BoxLogAIResponse>
                    <BoxLogAIResponse>
                      {t('aiChat.welcome.greeting3')}
                      {'\n\n'}• {t('aiChat.welcome.capabilities3.0')}
                      {'\n'}• {t('aiChat.welcome.capabilities3.1')}
                      {'\n'}• {t('aiChat.welcome.capabilities3.2')}
                      {'\n'}• {t('aiChat.welcome.capabilities3.3')}
                      {'\n\n'}
                      {t('aiChat.welcome.question3')}
                    </BoxLogAIResponse>
                  </BranchMessages>
                  <BranchSelector from="assistant">
                    <BranchPrevious />
                    <BranchPage />
                    <BranchNext />
                  </BranchSelector>
                </Branch>
              </MessageContent>
            </Message>
          ) : (
            state.messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat Input */}
      <ChatInput />
    </div>
  )
}
