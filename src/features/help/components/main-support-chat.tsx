'use client'

import React, { useCallback, useState } from 'react'

import { useChat, type UIMessage } from '@ai-sdk/react'

import { BotMessageSquare, Copy, MoreVertical, RefreshCw, Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/vercel-ai-elements/conversation'
import { Message, MessageContent } from '@/components/vercel-ai-elements/message'
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@/components/vercel-ai-elements/prompt-input'
import { Response } from '@/components/vercel-ai-elements/response'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import { useI18n } from '@/features/i18n/lib/hooks'

// Vercel AI SDK message type extension
interface ExtendedMessage extends UIMessage {
  createdAt?: Date
  relatedFiles?: string[]
  status?: 'sending' | 'sent' | 'error'
}

// Helper function to extract text content from UIMessage parts
const getMessageContent = (message: UIMessage): string => {
  const textParts = message.parts.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
  return textParts.map((part) => part.text).join(' ')
}

// BoxLog専用のAI Responseコンポーネント
const CodebaseAIResponse = ({ children }: { children: string }) => (
  <Response className="prose prose-sm dark:prose-invert max-w-none [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:dark:bg-gray-800 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_p]:leading-relaxed [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:dark:bg-gray-800 [&_ul]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    {children}
  </Response>
)

// ユーザー情報を取得するヘルパー
const useUserInfo = () => {
  const user = useAuthStore((state) => state.user)
  return {
    displayName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    profileIcon: user?.user_metadata?.profile_icon,
    avatarUrl: user?.user_metadata?.avatar_url,
  }
}

// アシスタントアイコンコンポーネント
const AssistantIcon = () => (
  <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
    <BotMessageSquare className="text-foreground h-4 w-4" />
  </div>
)

// 関連ファイル表示コンポーネント
const RelatedFiles = ({ files }: { files: string[] }) => (
  <div className="bg-muted mt-2 rounded p-2 text-xs">
    <div className="text-card-foreground mb-1 font-medium">関連ファイル:</div>
    {files.map((file, _index) => (
      <div key={file} className="text-muted-foreground font-mono">
        {file}
      </div>
    ))}
  </div>
)

// ユーザーメッセージ内容コンポーネント
const UserMessageContent = ({ message }: { message: UIMessage }) => {
  const { t } = useI18n()
  const extendedMessage = message as ExtendedMessage
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {getMessageContent(message)}
      {extendedMessage.status != null && (
        <div className="mt-1 text-xs opacity-75">
          {extendedMessage.status === 'sending' && t('help.messageStatus.sending')}
          {extendedMessage.status === 'error' && t('help.messageStatus.error')}
          {extendedMessage.status === 'sent' && t('help.messageStatus.sent')}
        </div>
      )}
    </div>
  )
}

// アシスタントメッセージ内容コンポーネント
const AssistantMessageContent = ({ message }: { message: UIMessage }) => {
  const extendedMessage = message as ExtendedMessage
  return (
    <div>
      <CodebaseAIResponse>{getMessageContent(message)}</CodebaseAIResponse>
      {extendedMessage.relatedFiles && extendedMessage.relatedFiles.length > 0 ? (
        <RelatedFiles files={extendedMessage.relatedFiles} />
      ) : null}
    </div>
  )
}

// ユーザーアバターコンポーネント
const UserAvatar = ({
  displayName,
  profileIcon,
  avatarUrl,
}: {
  displayName: string
  profileIcon?: string
  avatarUrl?: string
}) => (
  <div className="flex-shrink-0">
    {avatarUrl ? (
      <Avatar className="size-8">
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    ) : profileIcon ? (
      <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xl">{profileIcon}</div>
    ) : (
      <Avatar className="size-8">
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    )}
  </div>
)

const MessageBubble = ({ message }: { message: UIMessage }) => {
  const { displayName, profileIcon, avatarUrl } = useUserInfo()
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant' || message.role === 'system'

  // AIMessage componentは'user'または'assistant'のみ受け付けるため、'system'を'assistant'として扱う
  const messageFrom = message.role === 'system' ? 'assistant' : (message.role as 'user' | 'assistant')

  return (
    <Message from={messageFrom}>
      {isAssistant ? <AssistantIcon /> : null}

      <MessageContent>
        {isAssistant ? <AssistantMessageContent message={message} /> : <UserMessageContent message={message} />}

        {isAssistant && (message as ExtendedMessage).createdAt ? (
          <div className="mt-1 text-xs opacity-60">
            {new Date((message as ExtendedMessage).createdAt!).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        ) : null}
      </MessageContent>

      {isUser ? <UserAvatar displayName={displayName} profileIcon={profileIcon} avatarUrl={avatarUrl} /> : null}
    </Message>
  )
}

const MainSupportChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (_message: unknown, event: React.FormEvent) => void
  isLoading: boolean
}) => {
  const { t } = useI18n()
  const [_isComposing, _setIsComposing] = useState(false)

  const handleCompositionStart = useCallback(() => {
    _setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    _setIsComposing(false)
  }, [])

  const getSubmitStatus = () => {
    if (isLoading) return 'streaming'
    if (!input.trim()) return 'ready'
    return 'ready'
  }

  return (
    <div className="bg-background flex-shrink-0 p-6">
      {isLoading === true && (
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:0.2s]"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:0.4s]"></div>
          </div>
          <span>{t('help.status.checking')}</span>
        </div>
      )}

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={t('help.placeholder')}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-2">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <BotMessageSquare className="h-4 w-4" />
            <span>{t('help.subtitle')}</span>
          </div>

          <PromptInputSubmit disabled={!input.trim() || isLoading} />
        </div>
      </PromptInput>
    </div>
  )
}

export const MainSupportChat = () => {
  const [showMenu, setShowMenu] = useState(false)
  const { t } = useI18n()

  // Use Vercel AI SDK's useChat hook with simple configuration
  const chatHelpers = useChat({
    onError: (error) => {
      console.error('Chat error:', error)
    },
    onFinish: (message) => {
      console.log('Message finished:', message)
    },
    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'text' as const,
            text: `${t('help.welcome.greeting')}

${t('help.welcome.capabilities')}

${t('help.welcome.note')}

${t('help.mainSupportChat.greeting')}`,
          },
        ],
      },
    ],
  })

  // Extract properties from chat helpers
  const { messages, error, status, setMessages } = chatHelpers

  // Create our own input handling since useChat v2 doesn't provide these helpers
  const [input, setInput] = useState('')
  const isLoading = status === 'streaming'

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    (_message: unknown, event: React.FormEvent) => {
      event.preventDefault()
      if (!input.trim() || isLoading) return

      // Send message using sendMessage from useChat
      chatHelpers.sendMessage({
        text: input,
      })
      setInput('')
    },
    [input, isLoading, chatHelpers]
  )

  const reload = useCallback(() => {
    chatHelpers.regenerate()
  }, [chatHelpers])

  // Event handlers using useChat values
  const handleMenuToggle = useCallback(() => {
    setShowMenu(!showMenu)
  }, [showMenu])

  const handleClearMessages = useCallback(() => {
    setMessages([])
    setShowMenu(false)
  }, [setMessages])

  const handleExportMessages = useCallback(() => {
    const exportMessages = messages.map((msg) => ({
      role: msg.role,
      content: getMessageContent(msg),
      timestamp: (msg as ExtendedMessage).createdAt,
    }))
    navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
    setShowMenu(false)
  }, [messages])

  const handleReload = useCallback(() => {
    reload()
  }, [reload])

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background flex-shrink-0 border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full">
              <BotMessageSquare className="text-foreground h-6 w-6" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-semibold">{t('help.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('help.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Status indicator */}
            {isLoading === true && (
              <div className="p-2 text-blue-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
            )}

            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-2 transition-colors"
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
                    {t('help.actions.clearConversation')}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMessages}
                    className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    {t('help.actions.exportConversation')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <Conversation>
        <ConversationContent className="px-6 py-6">
          {/* Error display */}
          {error != null && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{t('help.status.error')}</span>
              </div>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{t('help.status.errorMessage')}</p>
              <button
                type="button"
                onClick={handleReload}
                className="mt-2 text-xs text-red-800 underline hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
              >
                {t('help.status.retryMessage')}
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <Message from="assistant">
              <AssistantIcon />
              <MessageContent>
                <CodebaseAIResponse>
                  {`${t('help.welcome.greeting')}

${t('help.welcome.capabilities')}

${t('help.welcome.note')}

${t('help.welcome.question')}`}
                </CodebaseAIResponse>
              </MessageContent>
            </Message>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat Input */}
      <MainSupportChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
