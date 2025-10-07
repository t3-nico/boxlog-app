'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'

import { ChevronLeft, ChevronRight, HelpCircle, PanelRight, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useChatStore } from '@/features/aichat/stores/useChatStore'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { askPanelSelectors, useAskPanelStore } from '../stores/useAskPanelStore'

import { AskPanelHeader } from './AskPanelHeader'
import { ChatInput } from './ChatInput'
import { HelpContent } from './HelpContent'
import { MessageBubble } from './MessageBubble'




const AIIntroduction = () => {
  const { sendMessage } = useChatStore()
  const { t } = useI18n()

  const quickPrompts = [
    { emoji: '📊', text: t('help.suggestions.analyzeProductivity'), description: t('help.suggestions.analyzeProductivityDesc') },
    { emoji: '🎯', text: t('help.suggestions.focusToday'), description: t('help.suggestions.focusTodayDesc') },
    { emoji: '📅', text: t('help.suggestions.organizeSchedule'), description: t('help.suggestions.organizeScheduleDesc') },
    { emoji: '💡', text: t('help.suggestions.suggestImprovements'), description: t('help.suggestions.suggestImprovementsDesc') },
  ]

  // jsx-no-bind optimization handler using data attributes
  const handlePromptClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const promptText = event.currentTarget.dataset.promptText
      if (promptText) {
        sendMessage(promptText)
      }
    },
    [sendMessage]
  )

  return (
    <div className="p-6">
      {/* AI Introduction */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
          <Sparkles className="h-8 w-8 text-white" />
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
        {quickPrompts.map((prompt, _index) => (
          <button
            type="button"
            key={`prompt-${prompt.text.slice(0, 20)}`}
            onClick={handlePromptClick}
            data-prompt-text={prompt.text}
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
const PanelMenuSelection = ({ onSelectTab }: { onSelectTab: (tab: 'ai' | 'help') => void }) => {
  const { t } = useI18n()
  const menuItems = [
    {
      id: 'ai' as const,
      title: t('help.askPanel.assistant'),
      description: t('help.askPanel.chatPlaceholder'),
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
              className={cn('flex w-full items-center gap-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 group text-left transition-colors')}
            >
              <div
                className={cn('h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-105', item.color)}
              >
                <ItemIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="text-foreground font-medium">{item.title}</h4>
                  {item.badge != null && (
                    <span
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-full"
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

export const AskPanel = () => {
  const { messages, unreadCount, markAsRead, sendMessage: _sendMessage } = useChatStore()
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
  }, [messages])

  // Mark messages as read when panel is expanded
  useEffect(() => {
    if (!collapsed && unreadCount > 0) {
      markAsRead()
    }
  }, [collapsed, unreadCount, markAsRead])

  // jsx-no-bind optimization handlers
  const handleTabSelect = useCallback((tab: 'ai' | 'help') => {
    setActiveTab(tab)
    setShowTabSelection(false)
  }, [])

  const handleDirectTabSelect = useCallback(
    (tab: 'ai' | 'help') => {
      setActiveTab(tab)
      setShowTabSelection(false)
      toggleCollapsed() // Expand the panel
    },
    [toggleCollapsed]
  )

  const handleDirectAISelect = useCallback(() => {
    handleDirectTabSelect('ai')
  }, [handleDirectTabSelect])

  const handleDirectHelpSelect = useCallback(() => {
    handleDirectTabSelect('help')
  }, [handleDirectTabSelect])

  const handleBackToMenu = useCallback(() => {
    setShowTabSelection(true)
  }, [])

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
            onClick={handleDirectAISelect}
            className="hover:bg-accent/50 group relative rounded-lg p-3 transition-colors"
            title="AI Assistant"
          >
            <Sparkles
              className="size-6 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400"
            />
            {unreadCount > 0 && (
              <div className="bg-neutral-100 dark:bg-neutral-900 absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full">
                <span className="text-xs text-white font-bold">
                  {Math.min(unreadCount, 9)}
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={handleDirectHelpSelect}
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
          onBackToMenu={handleBackToMenu}
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
                  {unreadCount > 0 && (
                    <div className="bg-neutral-100 dark:bg-neutral-900 flex h-5 w-5 items-center justify-center rounded-full">
                      <span className="text-xs text-white font-bold">
                        {Math.min(unreadCount, 9)}
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
            {messages.length === 0 ? (
              <>
                <div className="px-4 py-6">
                  <div className="flex items-start justify-start gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-sm flex-shrink-0 font-medium"
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
                {messages.map((message) => (
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
        <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      ) : (
        <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      )}
    </Button>
  )
}
