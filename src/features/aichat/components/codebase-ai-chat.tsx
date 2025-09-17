'use client'

import React, { useEffect, useState } from 'react'

import { useChat } from 'ai/react'

import { BotMessageSquare, Copy, MoreVertical, RefreshCw, Trash2, X } from 'lucide-react'

import { AIConversation, AIConversationContent, AIConversationScrollButton } from '@/components/kibo-ui/ai/conversation'
import { AIInput, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from '@/components/kibo-ui/ai/input'
import { AIMessage, AIMessageContent } from '@/components/kibo-ui/ai/message'
import { AIResponse } from '@/components/kibo-ui/ai/response'
import { Avatar } from '@/components/shadcn-ui/avatar'
import { useAuthContext } from '@/features/auth'

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
  const { user } = useAuthContext()
  return {
    userDisplayName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    profileIcon: user?.user_metadata?.profile_icon,
    avatarUrl: user?.user_metadata?.avatar_url
  }
}

// メッセージの状態表示
const MessageStatus = ({ status }: { status?: string }) => {
  if (!status) return null
  
  const statusText = {
    sending: 'Sending...',
    error: 'Send Error', 
    sent: 'Sent'
  }[status]
  
  return (
    <div className="mt-1 text-xs opacity-75">
      {statusText}
    </div>
  )
}

// 関連ファイル表示
const RelatedFiles = ({ files }: { files?: string[] }) => {
  if (!files || files.length === 0) return null
  
  return (
    <div className="bg-muted mt-2 rounded p-2 text-xs">
      <div className="text-card-foreground mb-1 font-medium">関連ファイル:</div>
      {files.map((file, index) => (
        <div key={`file-${file}-${index}`} className="text-muted-foreground font-mono">
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
  <div className="whitespace-pre-wrap text-sm leading-relaxed">
    {message.content}
    <MessageStatus status={message.status} />
  </div>
)

// ユーザーアバター
const UserAvatar = () => {
  const { userDisplayName, profileIcon, avatarUrl } = useUserInfo()
  const initials = userDisplayName.charAt(0).toUpperCase()
  
  if (avatarUrl) {
    return <Avatar src={avatarUrl} className="size-8" initials={initials} />
  }
  
  if (profileIcon) {
    return (
      <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xl">
        {profileIcon}
      </div>
    )
  }
  
  return <Avatar src={undefined} className="size-8" initials={initials} />
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
    <AIMessage from={messageFrom}>
      {isAssistant && <AssistantIcon />}

      <AIMessageContent>
        {isAssistant ? (
          <AssistantMessageContent message={message} />
        ) : (
          <UserMessageContent message={message} />
        )}
        {isAssistant && <MessageTimestamp createdAt={message.createdAt} />}
      </AIMessageContent>

      {isUser && (
        <div className="flex-shrink-0">
          <UserAvatar />
        </div>
      )}
    </AIMessage>
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
  handleSubmit: (e: React.FormEvent) => void
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

export const CodebaseAIChat = ({ isOpen, onClose }: CodebaseAIChatProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const [_isInitialized, _setIsInitialized] = useState(false)

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
    <div
      className="bg-background border-border fixed right-0 z-50 flex flex-col border-l"
      style={{
        top: '64px',
        bottom: '0',
        width: '320px',
      }}
    >
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
            {isLoading && (
              <div className="p-1 text-blue-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
              </div>
            )}

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-1 transition-colors"
                aria-label="Menu options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="bg-card border-border absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
                  <button
                    onClick={clearMessages}
                    className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear chat
                  </button>
                  <button
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
                    Export chat
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
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
      <AIConversation>
        <AIConversationContent className="px-4 py-4">
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
      <CodebaseChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
