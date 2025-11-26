// @ts-nocheck TODO(#389): 型エラー4件を段階的に修正する
'use client'

import React, { useEffect, useState } from 'react'

import { useChat } from '@ai-sdk/react'

import { BotMessageSquare, Copy, MoreVertical, RefreshCw, Trash2, X } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/vercel-ai-elements/conversation'
import { Message, MessageContent } from '@/components/vercel-ai-elements/message'
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@/components/vercel-ai-elements/prompt-input'
import { Response } from '@/components/vercel-ai-elements/response'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'

// GitHub APIの型定義
interface GitHubFile {
  name: string
  path: string
  content: string
  type: 'file' | 'dir'
}

interface GitHubTreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  url: string
}

interface GitHubSearchItem {
  name: string
  path: string
  sha: string
  url: string
  git_url: string
  html_url: string
  type: 'file'
}

// Vercel AI SDK message type extension
interface ExtendedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
  relatedFiles?: string[]
  status?: 'sending' | 'sent' | 'error'
}

interface CodebaseAIChatProps {
  isOpen: boolean
  onClose: () => void
}

// BoxLog専用のAI Responseコンポーネント
const CodebaseAIResponse = ({ children }: { children: string }) => (
  <Response className="prose prose-sm dark:prose-invert max-w-none [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:dark:bg-gray-800 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_p]:leading-relaxed [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:dark:bg-gray-800 [&_ul]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    {children}
  </Response>
)

// GitHub APIクライアント
class _GitHubCodebaseClient {
  private readonly REPO_OWNER = 't3-nico'
  private readonly REPO_NAME = 'boxlog-web'
  private readonly API_BASE = 'https://api.github.com'

  async fetchFileTree(): Promise<GitHubFile[]> {
    try {
      const response = await fetch(
        `${this.API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/git/trees/main?recursive=1`
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      return data.tree
        .filter((item: GitHubTreeItem) => item.type === 'blob')
        .map((item: GitHubTreeItem) => ({
          name: item.path.split('/').pop(),
          path: item.path,
          content: '',
          type: 'file' as const,
        }))
    } catch (error) {
      console.error('Failed to fetch file tree:', error)
      return []
    }
  }

  async fetchFileContent(path: string): Promise<string> {
    try {
      const response = await fetch(`${this.API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${path}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`)
      }

      const data = await response.json()
      return atob(data.content)
    } catch (error) {
      console.error(`Failed to fetch file content for ${path}:`, error)
      return ''
    }
  }

  async searchFiles(query: string): Promise<GitHubFile[]> {
    try {
      const response = await fetch(
        `${this.API_BASE}/search/code?q=${encodeURIComponent(query)}+repo:${this.REPO_OWNER}/${this.REPO_NAME}`
      )

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }

      const data = await response.json()
      return (
        data.items?.map((item: GitHubSearchItem) => ({
          name: item.name,
          path: item.path,
          content: '',
          type: 'file' as const,
        })) || []
      )
    } catch (error) {
      console.error('Failed to search files:', error)
      return []
    }
  }
}

// ユーザー情報を取得するヘルパー
const useUserInfo = () => {
  const user = useAuthStore((state) => state.user)
  return {
    userDisplayName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    profileIcon: user?.user_metadata?.profile_icon,
    avatarUrl: user?.user_metadata?.avatar_url,
  }
}

// メッセージの状態表示
const MessageStatus = ({ status }: { status?: string }) => {
  if (!status) return null

  const statusText = {
    sending: 'Sending...',
    error: 'Send Error',
    sent: 'Sent',
  }[status]

  return <div className="mt-1 text-xs opacity-75">{statusText}</div>
}

// 関連ファイル表示
const RelatedFiles = ({ files }: { files?: string[] }) => {
  if (!files || files.length === 0) return null

  return (
    <div className="bg-muted mt-2 rounded p-2 text-xs">
      <div className="text-card-foreground mb-1 font-medium">関連ファイル:</div>
      {files.map((file, _index) => (
        <div key={file} className="text-muted-foreground font-mono">
          {file}
        </div>
      ))}
    </div>
  )
}

// アシスタントメッセージコンテンツ
const AssistantMessageContent = ({ message }: { message: ExtendedMessage }) => (
  <div>
    <CodebaseAIResponse>{message.content}</CodebaseAIResponse>
    <RelatedFiles files={message.relatedFiles} />
  </div>
)

// ユーザーメッセージコンテンツ
const UserMessageContent = ({ message }: { message: ExtendedMessage }) => (
  <div className="text-sm leading-relaxed whitespace-pre-wrap">
    {message.content}
    <MessageStatus status={message.status} />
  </div>
)

// ユーザーアバター
const UserAvatar = () => {
  const { userDisplayName, profileIcon, avatarUrl } = useUserInfo()
  const initials = userDisplayName.charAt(0).toUpperCase()

  if (profileIcon) {
    return <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xl">{profileIcon}</div>
  }

  return <Avatar src={avatarUrl} initials={initials} className="size-8" />
}

// アシスタントアイコン
const AssistantIcon = () => (
  <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
    <BotMessageSquare className="text-foreground h-4 w-4" />
  </div>
)

// メッセージタイムスタンプ
const MessageTimestamp = ({ createdAt }: { createdAt?: string | Date }) => {
  if (!createdAt) return null

  return (
    <div className="mt-1 text-xs opacity-60">
      {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  )
}

const MessageBubble = ({ message }: { message: ExtendedMessage }) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant' || message.role === 'system'
  const messageFrom = message.role === 'system' ? 'assistant' : (message.role as 'user' | 'assistant')

  return (
    <Message from={messageFrom}>
      {isAssistant ? <AssistantIcon /> : null}

      <MessageContent>
        {isAssistant ? <AssistantMessageContent message={message} /> : <UserMessageContent message={message} />}
        {isAssistant ? <MessageTimestamp createdAt={message.createdAt} /> : null}
      </MessageContent>

      {isUser === true && (
        <div className="flex-shrink-0">
          <UserAvatar />
        </div>
      )}
    </Message>
  )
}

const CodebaseChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (_message: unknown, e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}) => {
  const [_isComposing, _setIsComposing] = useState(false)

  const getSubmitStatus = () => {
    if (isLoading) return 'streaming'
    if (!input.trim()) return 'ready'
    return 'ready'
  }

  return (
    <div className="bg-background flex-shrink-0 p-4">
      {isLoading === true && (
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm">
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:0.2s]"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:0.4s]"></div>
          </div>
          <span>Checking support info...</span>
        </div>
      )}

      <PromptInput onSubmit={handleSubmit}>
        <PromptInputTextarea
          value={input}
          onChange={handleInputChange}
          onCompositionStart={() => _setIsComposing(true)}
          onCompositionEnd={() => _setIsComposing(false)}
          placeholder="Ask about BoxLog features and usage..."
          disabled={isLoading}
        />
        <div className="flex items-center justify-between gap-2 px-3 pb-2">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <BotMessageSquare className="h-4 w-4" />
            <span>BoxLog Usage Support</span>
          </div>

          <PromptInputSubmit disabled={!input.trim() || isLoading} />
        </div>
      </PromptInput>
    </div>
  )
}

export const CodebaseAIChat = ({ isOpen, onClose }: CodebaseAIChatProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [_isInitialized, _setIsInitialized] = useState(false)
  const [_isComposing, _setIsComposing] = useState(false)

  // Use Vercel AI SDK's useChat hook with simple configuration
  const chatHelpers = useChat({
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

  // Extract properties from chat helpers
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
  } = chatHelpers as typeof chatHelpers & {
    input: string
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isLoading: boolean
    append: (message: { role: 'user' | 'assistant'; content: string }) => Promise<void>
    reload: () => void
  }

  // Debug: log messages when they change
  useEffect(() => {
    console.log('Messages updated:', messages)
  }, [messages])

  const clearMessages = () => {
    setMessages([])
    setShowMenu(false)
  }

  if (!isOpen) return null

  return (
    <div className="bg-background border-border fixed top-16 right-0 bottom-0 z-50 flex w-80 flex-col border-l">
      {/* Header */}
      <div className="bg-background h-16 flex-shrink-0">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="text-foreground h-6 w-6" />
            <div>
              <h3 className="text-foreground text-sm font-semibold">BoxLog Support</h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Status indicator */}
            {isLoading === true && (
              <div className="p-1 text-blue-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
            )}

            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-1 transition-colors"
                aria-label="Menu options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu != null && (
                <div className="bg-popover text-popover-foreground border-border absolute top-full right-0 z-50 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={clearMessages}
                    className="hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear chat
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
                    className="hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
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
              aria-label="Close codebase AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <Conversation>
        <ConversationContent className="px-4 py-4">
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
            <Message from="assistant">
              <div className="bg-muted flex inline-grid size-8 shrink-0 items-center justify-center rounded-full align-middle outline -outline-offset-1 outline-black/10 dark:outline-white/10">
                <BotMessageSquare className="text-foreground h-4 w-4" />
              </div>
              <MessageContent>
                <CodebaseAIResponse>
                  Hello! I&apos;m the **BoxLog** application support assistant. I can help you with: • 📅 **Calendar
                  Features** - How to use calendar views • 📋 **Task Management** - Creating and organizing tasks • 🏷️
                  **Tag System** - Categorizing and filtering • 📊 **Progress Tracking** - Monitoring productivity • 🔄
                  **Smart Folders** - Automated organization • 🛠️ **Troubleshooting** - Solving common issues **Note**:
                  I only provide support for BoxLog application usage. What would you like to know about BoxLog?
                </CodebaseAIResponse>
              </MessageContent>
            </Message>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message as ExtendedMessage} />)
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Chat Input */}
      <CodebaseChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
