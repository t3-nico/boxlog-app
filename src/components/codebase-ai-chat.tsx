'use client'

import React, { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
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

// Vercel AI SDK message type extension
interface ExtendedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
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

function MessageBubble({ message }: { message: ExtendedMessage }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  
  return (
    <AIMessage from={message.role}>
      {isAssistant && (
        <AIMessageAvatar 
          src="/users/support-ai-avatar.png"
          name="BoxLog Support"
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
        
        {isAssistant && message.createdAt && (
          <div className="mt-1 text-xs opacity-60">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
  input,
  handleInputChange,
  handleSubmit,
  isLoading 
}: { 
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}) {
  const [isComposing, setIsComposing] = useState(false)

  const getSubmitStatus = () => {
    if (isLoading) return 'streaming'
    if (!input.trim()) return 'ready'
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
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
              📋 BoxLog Usage Support
            </div>
          </AIInputTools>
          
          <AIInputSubmit
            disabled={!input.trim() || isLoading}
            status={getSubmitStatus()}
          />
        </AIInputToolbar>
      </AIInput>
    </div>
  )
}

export function CodebaseAIChat({ isOpen, onClose }: CodebaseAIChatProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use Vercel AI SDK's useChat hook with enhanced error handling
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append, error, reload } = useChat({
    api: '/api/chat/codebase',
    onError: (error) => {
      console.error('Chat error:', error)
      // Add user-friendly error message
      const errorMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant' as const,
        content: `I apologize, but I encountered an error: ${error.message}. Please try asking your question again.`,
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    },
    onFinish: (message) => {
      console.log('Message finished:', message)
    },
    onResponse: (response) => {
      console.log('Response received:', response.status, response.headers.get('content-type'))
    },
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      // Add any additional data if needed
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

What would you like to know about BoxLog?`
      }
    ]
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
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">BoxLog Support</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span>App Usage Support</span>
              </div>
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
                      const exportMessages = messages.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: msg.createdAt
                      }))
                      navigator.clipboard.writeText(JSON.stringify(exportMessages, null, 2))
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
          {/* Error display */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Unable to connect to BoxLog support. Please check your connection and try again.
              </p>
              <button
                onClick={() => reload()}
                className="mt-2 text-xs text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 underline"
              >
                Retry last message
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <AIMessage from="assistant">
              <AIMessageAvatar 
                src="/users/support-ai-avatar.png"
                name="BoxLog Support"
              />
              <AIMessageContent>
                <CodebaseAIResponse>
                  Hello! I'm the **BoxLog** application support assistant.
                  
                  I can help you with:
                  
                  • 📅 **Calendar Features** - How to use calendar views
                  • 📋 **Task Management** - Creating and organizing tasks
                  • 🏷️ **Tag System** - Categorizing and filtering
                  • 📊 **Progress Tracking** - Monitoring productivity
                  • 🔄 **Smart Folders** - Automated organization
                  • 🛠️ **Troubleshooting** - Solving common issues
                  
                  **Note**: I only provide support for BoxLog application usage.
                  
                  What would you like to know about BoxLog?
                </CodebaseAIResponse>
              </AIMessageContent>
            </AIMessage>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message as ExtendedMessage} />
            ))
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