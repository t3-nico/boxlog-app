'use client'

import React, { useState, useEffect } from 'react'
import { 
  X,
  ArrowUpCircle,
  Code2,
  Github,
  FileSearch,
  MoreVertical,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react'
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputSubmit,
  AIInputButton,
  AIInputTools
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

// GitHub APIの型定義
interface GitHubFile {
  name: string
  path: string
  content: string
  type: 'file' | 'dir'
}

interface CodebaseMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  status?: 'sending' | 'error' | 'sent'
  relatedFiles?: string[]
}

interface CodebaseAIChatProps {
  isOpen: boolean
  onClose: () => void
}

// BoxLog専用のAI Responseコンポーネント
const CodebaseAIResponse = ({ children, ...props }: { children: string; [key: string]: any }) => (
  <AIResponse
    className="prose prose-sm dark:prose-invert max-w-none
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
      [&_p]:leading-relaxed [&_p]:my-2
      [&_ul]:my-2 [&_ol]:my-2
      [&_li]:my-1
      [&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-800 [&_pre]:p-3 [&_pre]:rounded
      [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
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

// GitHub APIクライアント
class GitHubCodebaseClient {
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
        .filter((item: any) => item.type === 'blob')
        .map((item: any) => ({
          name: item.path.split('/').pop(),
          path: item.path,
          content: '',
          type: 'file' as const
        }))
    } catch (error) {
      console.error('Failed to fetch file tree:', error)
      return []
    }
  }
  
  async fetchFileContent(path: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${path}`
      )
      
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
      return data.items?.map((item: any) => ({
        name: item.name,
        path: item.path,
        content: '',
        type: 'file' as const
      })) || []
    } catch (error) {
      console.error('Failed to search files:', error)
      return []
    }
  }
}

function MessageBubble({ message }: { message: CodebaseMessage }) {
  const isUser = message.sender === 'user'
  const isAssistant = message.sender === 'assistant'
  
  return (
    <AIMessage from={message.sender}>
      {isAssistant && (
        <AIMessageAvatar 
          src="/users/codebase-ai-avatar.png"
          name="Codebase AI"
        />
      )}
      
      <AIMessageContent>
        {isAssistant ? (
          <div>
            <CodebaseAIResponse>
              {message.content}
            </CodebaseAIResponse>
            {message.relatedFiles && message.relatedFiles.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">関連ファイル:</div>
                {message.relatedFiles.map((file, index) => (
                  <div key={index} className="text-gray-600 dark:text-gray-400 font-mono">
                    {file}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
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
          src="/users/user-avatar.png"
          name="You"
        />
      )}
    </AIMessage>
  )
}

function CodebaseChatInput({ 
  onSendMessage,
  isLoading 
}: { 
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
}) {
  const [inputValue, setInputValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      const message = inputValue.trim()
      setInputValue('')
      await onSendMessage(message)
    }
  }

  const getSubmitStatus = () => {
    if (isLoading) return 'streaming'
    if (!inputValue.trim()) return 'ready'
    return 'ready'
  }

  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      {isLoading && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span>Analyzing codebase...</span>
        </div>
      )}
      
      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Ask about boxlog-web codebase..."
          disabled={isLoading}
          minHeight={40}
          maxHeight={120}
        />
        <AIInputToolbar>
          <AIInputTools>
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
              📚 boxlog-web only
            </div>
          </AIInputTools>
          
          <AIInputSubmit
            disabled={!inputValue.trim() || isLoading}
            status={getSubmitStatus()}
          />
        </AIInputToolbar>
      </AIInput>
    </div>
  )
}

export function CodebaseAIChat({ isOpen, onClose }: CodebaseAIChatProps) {
  const [messages, setMessages] = useState<CodebaseMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [githubClient] = useState(() => new GitHubCodebaseClient())
  const [isInitialized, setIsInitialized] = useState(false)

  // 初期化処理
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeCodebase()
    }
  }, [isOpen, isInitialized])

  const initializeCodebase = async () => {
    setIsLoading(true)
    try {
      // GitHub APIでファイル一覧を取得
      const files = await githubClient.fetchFileTree()
      console.log(`Loaded ${files.length} files from boxlog-web repository`)
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize codebase:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content: string) => {
    const userMessage: CodebaseMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // ここでVercel AI SDKまたは独自のAI APIを呼び出す
      // 現在はモック応答
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiResponse: CodebaseMessage = {
        id: (Date.now() + 1).toString(),
        content: `boxlog-webリポジトリについて「${content}」のご質問ですね。\n\n現在このコードベース専用AIは開発中です。近日中に以下の機能を提供予定です：\n\n• コード検索と解析\n• 機能の説明と使い方\n• バグ修正の提案\n• 新機能の実装方法\n\n**注意**: 私はboxlog-webリポジトリの内容についてのみお答えします。`,
        sender: 'assistant',
        timestamp: new Date(),
        relatedFiles: ['src/components/ui/button.tsx', 'README.md']
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: CodebaseMessage = {
        id: (Date.now() + 1).toString(),
        content: 'エラーが発生しました。後でもう一度お試しください。',
        sender: 'assistant',
        timestamp: new Date(),
        status: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setShowMenu(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed right-0 w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col"
      style={{ 
        top: '64px',
        bottom: '0'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Codebase AI</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Github className="w-3 h-3" />
                <span>boxlog-web</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Refresh Button */}
            <button
              onClick={initializeCodebase}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
              aria-label="Refresh codebase"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="Menu options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                  <button
                    onClick={clearMessages}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear chat
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(messages))
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label="Close codebase AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <AIConversation>
        <AIConversationContent>
          {messages.length === 0 ? (
            <AIMessage from="assistant">
              <AIMessageAvatar 
                src="/users/codebase-ai-avatar.png"
                name="Codebase AI"
              />
              <AIMessageContent>
                <CodebaseAIResponse>
                  こんにちは！私は **boxlog-web** リポジトリ専用のAIアシスタントです。
                  
                  以下についてお答えできます：
                  
                  • **コードの構造と機能**の説明
                  • **特定の実装方法**のアドバイス
                  • **バグやエラー**の解決方法
                  • **新機能の追加**に関する提案
                  
                  **注意**: boxlog-webリポジトリの内容についてのみお答えします。
                  
                  何について知りたいですか？
                </CodebaseAIResponse>
              </AIMessageContent>
            </AIMessage>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      
      {/* Chat Input */}
      <CodebaseChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  )
}