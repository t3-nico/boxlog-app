'use client'

import React, { useState } from 'react'

import { useChat } from 'ai/react'

import { BotMessageSquare, Copy, MoreVertical, RefreshCw, Trash2 } from 'lucide-react'

import { AIConversation, AIConversationContent, AIConversationScrollButton } from '@/components/kibo-ui/ai/conversation'
import { AIInput, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from '@/components/kibo-ui/ai/input'
import { AIMessage, AIMessageContent } from '@/components/kibo-ui/ai/message'
import { AIResponse } from '@/components/kibo-ui/ai/response'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { useAuthContext } from '@/features/auth'

// Vercel AI SDK message type extension
interface ExtendedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
  relatedFiles?: string[]
  status?: 'sending' | 'sent' | 'error'
}

// BoxLog専用のAI Responseコンポーネント
const CodebaseAIResponse = ({ children, ...props }: { children: string; [key: string]: unknown }) => (
  <AIResponse
    className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:dark:bg-gray-800 [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_p]:leading-relaxed [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:dark:bg-gray-800 [&_ul]:my-2"
    options={{
      disallowedElements: ['script', 'iframe'],
      remarkPlugins: [],
    }}
    {...props}
  >
    {children}
  </AIResponse>
)

// ユーザー情報を取得するヘルパー
const useUserInfo = () => {
  const { user } = useAuthContext()
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
const UserMessageContent = ({ message }: { message: ExtendedMessage }) => (
  <div className="whitespace-pre-wrap text-sm leading-relaxed">
    {message.content}
    {message.status && (
      <div className="mt-1 text-xs opacity-75">
        {message.status === 'sending' && 'Sending...'}
        {message.status === 'error' && 'Send Error'}
        {message.status === 'sent' && 'Sent'}
      </div>
    )}
  </div>
)

// アシスタントメッセージ内容コンポーネント
const AssistantMessageContent = ({ message }: { message: ExtendedMessage }) => (
  <div>
    <CodebaseAIResponse>{message.content}</CodebaseAIResponse>
    {message.relatedFiles && message.relatedFiles.length > 0 && <RelatedFiles files={message.relatedFiles} />}
  </div>
)

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
      <Avatar src={avatarUrl} className="size-8" initials={displayName.charAt(0).toUpperCase()} />
    ) : profileIcon ? (
      <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xl">{profileIcon}</div>
    ) : (
      <Avatar src={undefined} className="size-8" initials={displayName.charAt(0).toUpperCase()} />
    )}
  </div>
)

const MessageBubble = ({ message }: { message: ExtendedMessage }) => {
  const { displayName, profileIcon, avatarUrl } = useUserInfo()
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant' || message.role === 'system'

  // AIMessage componentは'user'または'assistant'のみ受け付けるため、'system'を'assistant'として扱う
  const messageFrom = message.role === 'system' ? 'assistant' : (message.role as 'user' | 'assistant')

  return (
    <AIMessage from={messageFrom}>
      {isAssistant && <AssistantIcon />}

      <AIMessageContent>
        {isAssistant ? <AssistantMessageContent message={message} /> : <UserMessageContent message={message} />}

        {isAssistant && message.createdAt && (
          <div className="mt-1 text-xs opacity-60">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </AIMessageContent>

      {isUser && <UserAvatar displayName={displayName} profileIcon={profileIcon} avatarUrl={avatarUrl} />}
    </AIMessage>
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
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}) => {
  const [_isComposing, setIsComposing] = useState(false)

  const getSubmitStatus = () => {
    if (isLoading) return 'streaming'
    if (!input.trim()) return 'ready'
    return 'ready'
  }

  return (
    <div className="bg-background flex-shrink-0 p-6">
      {isLoading && (
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span>Checking support info...</span>
        </div>
      )}

      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea
          value={input}
          onChange={handleInputChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Ask about BoxLog features and usage..."
          disabled={isLoading}
          minHeight={40}
          maxHeight={120}
        />
        <AIInputToolbar>
          <AIInputTools>
            <div className="text-muted-foreground flex items-center gap-1 px-2 text-xs">
              <BotMessageSquare className="h-4 w-4" />
              <span>BoxLog Usage Support</span>
            </div>
          </AIInputTools>

          <AIInputSubmit disabled={!input.trim() || isLoading} status={getSubmitStatus()} />
        </AIInputToolbar>
      </AIInput>
    </div>
  )
}

export const MainSupportChat = () => {
  const [showMenu, setShowMenu] = useState(false)

  // Use Vercel AI SDK's useChat hook with simple configuration
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append: _append,
    error,
    reload,
  } = useChat({
    api: '/api/chat/codebase',
    onError: (error) => {
      console.error('Chat error:', error)
    },
    onFinish: (message) => {
      console.log('Message finished:', message)
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm the **BoxLog** application support assistant.

I can help you with:

• 📅 **Calendar Features** - How to use calendar views
• 📋 **Task Management** - Creating and organizing tasks
• 🏷️ **Tag System** - Categorizing and filtering
• 📊 **Progress Tracking** - Monitoring productivity
• 🔄 **Smart Folders** - Automated organization
• 🛠️ **Troubleshooting** - Solving common issues

**Note**: I only provide support for BoxLog application usage.

What would you like to know about BoxLog?`,
      },
    ],
  })

  const clearMessages = () => {
    setMessages([])
    setShowMenu(false)
  }

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <div className="border-border bg-background flex-shrink-0 border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full">
              <BotMessageSquare className="text-foreground h-5 w-5" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-semibold">BoxLog Support</h3>
              <p className="text-muted-foreground text-sm">Your AI assistant for BoxLog usage</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Status indicator */}
            {isLoading && (
              <div className="p-2 text-blue-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
            )}

            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-2 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="bg-card border-border absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={clearMessages}
                    className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear conversation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const exportMessages = messages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: msg.createdAt,
                      }))
                      navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
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
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <AIConversation>
        <AIConversationContent className="px-6 py-6">
          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Unable to connect to BoxLog support. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => reload()}
                className="mt-2 text-xs text-red-800 underline hover:text-red-900 dark:text-red-200 dark:hover:text-red-100"
              >
                Retry last message
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <AIMessage from="assistant">
              <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
                <BotMessageSquare className="text-foreground h-4 w-4" />
              </div>
              <AIMessageContent>
                <CodebaseAIResponse>
                  Hello! I&apos;m the **BoxLog** application support assistant. I can help you with: • 📅 **Calendar
                  Features** - How to use calendar views • 📋 **Task Management** - Creating and organizing tasks • 🏷️
                  **Tag System** - Categorizing and filtering • 📊 **Progress Tracking** - Monitoring productivity • 🔄
                  **Smart Folders** - Automated organization • 🛠️ **Troubleshooting** - Solving common issues **Note**:
                  I only provide support for BoxLog application usage. What would you like to know about BoxLog?
                </CodebaseAIResponse>
              </AIMessageContent>
            </AIMessage>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message as ExtendedMessage} />)
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

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
