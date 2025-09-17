'use client'

import { useEffect, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'

import {
  ArrowUpCircle,
  Book,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  MoreVertical,
  PanelRight,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { border, colors, rounded, spacing, typography } from '@/config/theme'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'

import { askPanelSelectors, useAskPanelStore } from '../stores/useAskPanelStore'

interface MessageBubbleProps {
  message: ChatMessage
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
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
      <div className="group mb-6 flex justify-end">
        <div className="relative">
          <div
            className={`${colors.primary.DEFAULT} ${colors.text.white} ${rounded.component.modal.lg} rounded-tr-sm ${spacing.modal} max-w-[85%] break-words`}
          >
            {isEditing ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full bg-transparent ${colors.text.white} resize-none border-none placeholder-blue-200 outline-none ${typography.body.sm} leading-relaxed`}
                  rows={1}
                  style={{ minHeight: '1.5rem' }}
                />
                <div className={`mt-2 flex items-center gap-2 border-t border-blue-500 pt-2`}>
                  <button
                    type="button"
                    onClick={handleSave}
                    className={`p-1 hover:bg-blue-500 ${rounded.component.button.sm} transition-colors`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={`p-1 hover:bg-blue-500 ${rounded.component.button.sm} transition-colors`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
            )}
            {message.status && !isEditing && (
              <div className={`mt-1 ${typography.body.xs} text-blue-100 opacity-75`}>
                {message.status === 'sending' && '送信中...'}
                {message.status === 'error' && '送信エラー'}
              </div>
            )}
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="text-muted-foreground hover:text-foreground absolute -left-8 top-1/2 -translate-y-1/2 p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex items-start justify-start gap-3">
      {/* AI Avatar */}
      <div
        className={`h-8 w-8 ${rounded.component.avatar.full} flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 ${colors.text.white} ${typography.body.sm} flex-shrink-0 font-medium`}
      >
        <Sparkles className="h-4 w-4" />
      </div>

      {/* AI Message Bubble */}
      <div className="bg-background text-foreground border-border max-w-[85%] break-words rounded-2xl rounded-tl-sm border px-4 py-3">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        <div className="text-muted-foreground mt-1 text-xs">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

const ChatInput = () => {
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
      const { scrollHeight } = textareaRef.current
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [state.inputValue])

  return (
    <div className="flex-shrink-0 p-4">
      {/* Typing indicator */}
      {state.isTyping && (
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

      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={state.inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Ask Claude..."
            className={`w-full resize-none ${rounded.component.modal.lg} border ${border.universal} ${colors.background.card} ${spacing.card} pr-12 ${typography.body.sm} max-h-32 min-h-[44px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500 ${colors.text.placeholder} scrollbar-hide`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            disabled={state.isTyping}
            rows={1}
          />

          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className="text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 absolute bottom-2 right-2 p-2 transition-colors focus:outline-none disabled:cursor-not-allowed"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

const AskPanelHeader = ({
  activeTab,
  _onTabChange,
  _onBackToMenu,
}: {
  activeTab: 'ai' | 'help'
  onTabChange: (tab: 'ai' | 'help' | 'menu') => void
  onBackToMenu: () => void
}) => {
  const { clearMessages } = useChatContext()
  const { toggleCollapsed } = useAskPanelStore()
  const [showMenu, setShowMenu] = useState(false)

  const tabs = [
    {
      id: 'ai' as const,
      label: 'AI Chat',
      icon: Sparkles,
      color: 'from-purple-600 to-blue-600',
    },
    {
      id: 'help' as const,
      label: 'Help',
      icon: HelpCircle,
      color: 'from-green-600 to-emerald-600',
    },
  ]

  const activeTabData = tabs.find((tab) => tab.id === activeTab)!

  return (
    <div className="border-border flex-shrink-0 border-b">
      {/* Header with collapse button and active tab info */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${activeTabData.color} flex items-center justify-center`}
            >
              <activeTabData.icon className={`h-4 w-4 ${colors.text.white}`} />
            </div>
            <div>
              <h3 className="text-foreground font-semibold">{activeTabData.label}</h3>
              <p className="text-muted-foreground text-xs">
                {activeTab === 'ai' ? 'Your AI assistant' : 'Documentation & support'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Menu for AI tab */}
            {activeTab === 'ai' && (
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
                      onClick={() => {
                        clearMessages()
                        setShowMenu(false)
                      }}
                      className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear conversation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify({}))
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
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={toggleCollapsed}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-2 transition-colors"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AIIntroduction = () => {
  const { sendMessage } = useChatContext()

  const quickPrompts = [
    { emoji: '📊', text: 'Analyze my productivity patterns', description: 'Get insights on your work patterns' },
    { emoji: '🎯', text: 'What tasks should I focus on today?', description: 'Prioritize your day' },
    { emoji: '📅', text: 'Help me organize my schedule', description: 'Optimize your calendar' },
    { emoji: '💡', text: 'Suggest productivity improvements', description: 'Enhance your workflow' },
  ]

  return (
    <div className="p-6">
      {/* AI Introduction */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
          <Sparkles className={`h-8 w-8 ${colors.text.white}`} />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">Ask Claude</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          I&apos;m your AI assistant for productivity and task management. I can help you analyze patterns, organize
          tasks, and optimize your workflow.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="text-foreground mb-3 text-sm font-medium">Quick actions</div>
        {quickPrompts.map((prompt, index) => (
          <button
            type="button"
            key={index}
            onClick={() => sendMessage(prompt.text)}
            className="hover:bg-accent/50 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
          >
            <span className="text-xl">{prompt.emoji}</span>
            <div className="flex-1">
              <div className="text-foreground text-sm font-medium">{prompt.text}</div>
              <div className="text-muted-foreground text-xs">{prompt.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// メニュー選択画面（collapsed状態から開いた時の初期画面）
const _PanelMenuSelection = ({ onSelectTab }: { onSelectTab: (tab: 'ai' | 'help') => void }) => {
  const menuItems = [
    {
      id: 'ai' as const,
      title: 'AI Assistant',
      description: 'Chat with Claude for productivity insights and task management',
      icon: Sparkles,
      color: 'from-purple-600 to-blue-600',
      badge: null,
    },
    {
      id: 'help' as const,
      title: 'Help & Support',
      description: 'Documentation, guides, and frequently asked questions',
      icon: HelpCircle,
      color: 'from-green-600 to-emerald-600',
      badge: null,
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">BoxLog Assistant</h3>
        <p className="text-muted-foreground text-sm">Choose from the available tools and resources</p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => {
          const ItemIcon = item.icon
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center gap-4 ${spacing.card} ${rounded.component.card.lg} border ${border.universal} ${colors.hover.background.subtle} group text-left transition-colors`}
            >
              <div
                className={`h-12 w-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center transition-transform group-hover:scale-105`}
              >
                <ItemIcon className={`h-6 w-6 ${colors.text.white}`} />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="text-foreground font-medium">{item.title}</h4>
                  {item.badge && (
                    <span
                      className={`px-2 py-1 ${typography.body.xs} bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 ${rounded.component.badge.full}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground h-6 w-6 transition-colors" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Help画面のコンテンツ
const HelpContent = () => {
  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Quick Start Guide', description: 'Learn the basics of BoxLog' },
        { title: 'Creating Your First Task', description: 'Step-by-step tutorial' },
        { title: 'Setting Up Your Workspace', description: 'Customize your environment' },
      ],
    },
    {
      title: 'Features',
      items: [
        { title: 'Calendar View', description: 'Managing tasks in calendar format' },
        { title: 'Tags & Smart Folders', description: 'Organizing with tags and automation' },
        { title: 'Productivity Analytics', description: 'Understanding your work patterns' },
      ],
    },
    {
      title: 'Troubleshooting',
      items: [
        { title: 'Common Issues', description: 'Solutions to frequent problems' },
        { title: 'Performance Tips', description: 'Optimize your BoxLog experience' },
        { title: 'Data Backup', description: 'Keep your data safe' },
      ],
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600">
          <Book className={`h-8 w-8 ${colors.text.white}`} />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">Help & Support</h3>
        <p className="text-muted-foreground text-sm">Find answers and learn how to make the most of BoxLog</p>
      </div>

      <div className="space-y-6">
        {helpSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h4 className="text-foreground mb-3 font-medium">{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <button
                  type="button"
                  key={itemIndex}
                  className="hover:bg-accent/50 group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors"
                >
                  <div>
                    <div className="text-foreground mb-1 font-medium">{item.title}</div>
                    <div className="text-muted-foreground text-sm">{item.description}</div>
                  </div>
                  <ExternalLink className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background border-border mt-8 rounded-lg border p-4">
        <div className="mb-2 flex items-center gap-3">
          <MessageSquare className={`h-6 w-6 text-blue-600 dark:text-blue-400`} />
          <span className="text-foreground font-medium">Need more help?</span>
        </div>
        <p className="text-muted-foreground mb-3 text-sm">
          Can&apos;t find what you&apos;re looking for? Contact our support team.
        </p>
        <button
          type="button"
          className={`${typography.body.sm} font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300`}
        >
          Contact Support →
        </button>
      </div>
    </div>
  )
}

export const AskPanel = () => {
  const { state, markAsRead, sendMessage: _sendMessage } = useChatContext()
  const _isOpen = useAskPanelStore(askPanelSelectors.getIsOpen)
  const collapsed = useAskPanelStore(askPanelSelectors.getCollapsed)
  const currentWidth = useAskPanelStore(askPanelSelectors.getCurrentWidth)
  const { toggleCollapsed, collapse: _collapse } = useAskPanelStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<'ai' | 'help' | 'menu'>('ai') // デフォルトでAIタブを選択
  const [showTabSelection, setShowTabSelection] = useState(false) // 最初からAIチャットを表示

  // Check if mobile on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset to menu when collapsed
  useEffect(() => {
    if (collapsed) {
      setActiveTab('menu')
      setShowTabSelection(true)
    }
  }, [collapsed])

  // Auto-select AI tab when on AI chat page
  useEffect(() => {
    if (pathname === '/ai-chat' && !collapsed) {
      setActiveTab('ai')
      setShowTabSelection(false)
    }
  }, [pathname, collapsed])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  // Mark messages as read when panel is expanded
  useEffect(() => {
    if (!collapsed && state.unreadCount > 0) {
      markAsRead()
    }
  }, [collapsed, state.unreadCount, markAsRead])

  // Handle tab selection from menu
  const handleTabSelect = (tab: 'ai' | 'help') => {
    setActiveTab(tab)
    setShowTabSelection(false)
  }

  // Handle direct tab selection from collapsed state
  const handleDirectTabSelect = (tab: 'ai' | 'help') => {
    setActiveTab(tab)
    setShowTabSelection(false)
    toggleCollapsed() // Expand the panel
  }

  // Collapsed state - icon only with sidebar-like design
  if (collapsed) {
    return (
      <div
        className="bg-background border-border flex h-full flex-col items-center border-l transition-all duration-300"
        style={{ width: `${currentWidth}px` }}
      >
        {/* Menu Icons */}
        <div className="flex flex-col items-center space-y-2 px-4 pt-4">
          <button
            type="button"
            onClick={() => handleDirectTabSelect('ai')}
            className="hover:bg-accent/50 group relative rounded-lg p-3 transition-colors"
            title="AI Assistant"
          >
            <Sparkles
              className={`size-6 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400`}
            />
            {state.unreadCount > 0 && (
              <div className="bg-background absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full">
                <span className={`${typography.body.xs} ${colors.text.white} font-bold`}>
                  {Math.min(state.unreadCount, 9)}
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDirectTabSelect('help')}
            className="hover:bg-accent/50 group rounded-lg p-3 transition-colors"
            title="Help & Support"
          >
            <HelpCircle
              className={`size-6 text-green-600 transition-transform group-hover:scale-110 dark:text-green-400`}
            />
          </button>
        </div>
      </div>
    )
  }

  // Expanded state - show menu selection or specific tab content
  return (
    <div
      className="bg-background border-border flex h-full flex-col overflow-hidden border-l transition-all duration-300 max-lg:fixed max-lg:inset-0 max-lg:z-50"
      style={{
        width: isMobile ? '100%' : `${currentWidth}px`,
      }}
    >
      {/* Header - only show when specific tab is selected */}
      {!showTabSelection && activeTab !== 'menu' && (
        <AskPanelHeader
          activeTab={activeTab as 'ai' | 'help'}
          onTabChange={setActiveTab}
          onBackToMenu={() => setShowTabSelection(true)}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showTabSelection ? (
          // Menu selection screen - sidebar style
          <div className="flex h-full w-64 flex-col">
            {/* Header with collapse button */}
            <div className="flex items-center p-4">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-2 transition-colors"
                title="Collapse panel"
              >
                <PanelRight className="size-6" />
              </button>
              <h3 className="text-foreground ml-3 text-lg font-semibold">Assistant</h3>
            </div>

            {/* Menu Items - Sidebar style */}
            <div className="flex-1 px-4 pb-4">
              <div className="space-y-2" style={{ maxWidth: '256px' }}>
                <button
                  type="button"
                  onClick={() => handleTabSelect('ai')}
                  className="hover:bg-accent/50 group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors"
                >
                  <Sparkles className="size-6 shrink-0 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400" />
                  <div className="flex-1">
                    <div className="text-foreground font-medium">AI Chat</div>
                    <div className="text-muted-foreground text-xs">Ask Claude for help</div>
                  </div>
                  {state.unreadCount > 0 && (
                    <div className="bg-background flex h-5 w-5 items-center justify-center rounded-full">
                      <span className={`${typography.body.xs} ${colors.text.white} font-bold`}>
                        {Math.min(state.unreadCount, 9)}
                      </span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSelect('help')}
                  className="hover:bg-accent/50 group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors"
                >
                  <HelpCircle className="size-6 shrink-0 text-green-600 transition-transform group-hover:scale-110 dark:text-green-400" />
                  <div className="flex-1">
                    <div className="text-foreground font-medium">Help & Support</div>
                    <div className="text-muted-foreground text-xs">Documentation & guides</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'ai' ? (
          // AI Chat content
          <>
            {state.messages.length === 0 ? (
              <>
                <div className="px-4 py-6">
                  <div className="flex items-start justify-start gap-3">
                    <div
                      className={`h-8 w-8 ${rounded.component.avatar.full} flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 ${colors.text.white} ${typography.body.sm} flex-shrink-0 font-medium`}
                    >
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="bg-background text-foreground border-border rounded-2xl rounded-tl-sm border px-4 py-3">
                      <div className="text-sm leading-relaxed">
                        Hi! I&apos;m Claude, your AI assistant in BoxLog. I can help you with:
                      </div>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Analyzing your tasks and productivity patterns</li>
                        <li>• Creating and organizing tasks</li>
                        <li>• Scheduling and time management</li>
                        <li>• Answering questions about your data</li>
                      </ul>
                      <div className="text-muted-foreground mt-3 text-sm">
                        Try one of the quick actions below, or ask me anything!
                      </div>
                    </div>
                  </div>
                </div>
                <AIIntroduction />
              </>
            ) : (
              <div className="space-y-6 px-4 py-6">
                {state.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        ) : (
          // Help content
          <HelpContent />
        )}
      </div>

      {/* Chat input - only show for AI tab */}
      {!showTabSelection && activeTab === 'ai' && <ChatInput />}
    </div>
  )
}

// Ask Panel Toggle Button for Header
export const AskPanelToggleButton = () => {
  const { open, toggleCollapsed } = useAskPanelStore()
  const isOpen = useAskPanelStore(askPanelSelectors.getIsOpen)
  const collapsed = useAskPanelStore(askPanelSelectors.getCollapsed)
  const showInHeader = useAskPanelStore(askPanelSelectors.getShowInHeader)

  if (!showInHeader) return null

  const handleClick = () => {
    // シンプルに常に開いて、folded状態を切り替え
    open()
    if (isOpen) {
      toggleCollapsed()
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} className="flex h-auto items-center gap-2 px-3 py-2">
      <Sparkles className={`h-4 w-4 text-purple-600 dark:text-purple-400`} />
      <span className="text-sm font-medium">Ask Claude</span>
      {!isOpen || collapsed ? (
        <ChevronLeft className={`h-4 w-4 ${colors.text.muted}`} />
      ) : (
        <ChevronRight className={`h-4 w-4 ${colors.text.muted}`} />
      )}
    </Button>
  )
}
