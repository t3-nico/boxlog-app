'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  ArrowUpCircle,
  MoreVertical,
  Trash2,
  Copy,
  Sparkles,
  Pencil,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Calendar,
  Clock,
  PanelRight,
  HelpCircle,
  Book,
  ExternalLink
} from 'lucide-react'
import { useChatContext, type ChatMessage } from '@/contexts/chat-context'
import { useAskPanelStore, askPanelSelectors } from '@/stores/useAskPanelStore'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
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
      <div className="mb-6 flex justify-end group">
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] break-words">
            {isEditing ? (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-white placeholder-blue-200 border-none outline-none resize-none text-sm leading-relaxed"
                  rows={1}
                  style={{ minHeight: '1.5rem' }}
                />
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-500">
                  <button
                    onClick={handleSave}
                    className="p-1 hover:bg-blue-500 rounded transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 hover:bg-blue-500 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
            )}
            {message.status && !isEditing && (
              <div className="mt-1 text-xs text-blue-100 opacity-75">
                {message.status === 'sending' && '送信中...'}
                {message.status === 'error' && '送信エラー'}
              </div>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="mb-6 flex justify-start items-start gap-3">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* AI Message Bubble */}
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] break-words">
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function ChatInput() {
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
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px'
    }
  }, [state.inputValue])

  return (
    <div className="flex-shrink-0 p-4">
      {/* Typing indicator */}
      {state.isTyping && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
            className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 max-h-32 min-h-[44px] placeholder-gray-500 dark:placeholder-gray-400 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            disabled={state.isTyping}
            rows={1}
          />
          
          <button
            type="submit"
            disabled={!state.inputValue.trim() || state.isTyping}
            className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none"
          >
            <ArrowUpCircle className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  )
}

function AskPanelHeader({ 
  activeTab, 
  onTabChange, 
  onBackToMenu 
}: { 
  activeTab: 'ai' | 'help'
  onTabChange: (tab: 'ai' | 'help' | 'menu') => void
  onBackToMenu: () => void
}) {
  const { clearMessages } = useChatContext()
  const { toggleCollapsed } = useAskPanelStore()
  const [showMenu, setShowMenu] = useState(false)

  const tabs = [
    {
      id: 'ai' as const,
      label: 'AI Chat',
      icon: Sparkles,
      color: 'from-purple-600 to-blue-600'
    },
    {
      id: 'help' as const,
      label: 'Help',
      icon: HelpCircle,
      color: 'from-green-600 to-emerald-600'
    }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)!

  return (
    <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
      {/* Header with collapse button and active tab info */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeTabData.color} flex items-center justify-center`}>
              <activeTabData.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{activeTabData.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeTab === 'ai' ? 'Your AI assistant' : 'Documentation & support'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Menu for AI tab */}
            {activeTab === 'ai' && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                    <button
                      onClick={() => {
                        clearMessages()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear conversation
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify({}))
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Export conversation
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={toggleCollapsed}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
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

function AIIntroduction() {
  const { sendMessage } = useChatContext()

  const quickPrompts = [
    { emoji: "📊", text: "Analyze my productivity patterns", description: "Get insights on your work patterns" },
    { emoji: "🎯", text: "What tasks should I focus on today?", description: "Prioritize your day" },
    { emoji: "📅", text: "Help me organize my schedule", description: "Optimize your calendar" },
    { emoji: "💡", text: "Suggest productivity improvements", description: "Enhance your workflow" },
  ]

  return (
    <div className="p-6">
      {/* AI Introduction */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Ask Claude</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          I&apos;m your AI assistant for productivity and task management. I can help you analyze patterns, organize tasks, and optimize your workflow.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick actions</div>
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => sendMessage(prompt.text)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <span className="text-xl">{prompt.emoji}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {prompt.text}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {prompt.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// メニュー選択画面（collapsed状態から開いた時の初期画面）
function PanelMenuSelection({ onSelectTab }: { onSelectTab: (tab: 'ai' | 'help') => void }) {
  const menuItems = [
    {
      id: 'ai' as const,
      title: 'AI Assistant',
      description: 'Chat with Claude for productivity insights and task management',
      icon: Sparkles,
      color: 'from-purple-600 to-blue-600',
      badge: null
    },
    {
      id: 'help' as const,
      title: 'Help & Support',
      description: 'Documentation, guides, and frequently asked questions',
      icon: HelpCircle,
      color: 'from-green-600 to-emerald-600',
      badge: null
    }
  ]

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">BoxLog Assistant</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose from the available tools and resources
        </p>
      </div>
      
      <div className="space-y-3">
        {menuItems.map((item) => {
          const ItemIcon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <ItemIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h4>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Help画面のコンテンツ
function HelpContent() {
  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        { title: 'Quick Start Guide', description: 'Learn the basics of BoxLog' },
        { title: 'Creating Your First Task', description: 'Step-by-step tutorial' },
        { title: 'Setting Up Your Workspace', description: 'Customize your environment' }
      ]
    },
    {
      title: 'Features',
      items: [
        { title: 'Calendar View', description: 'Managing tasks in calendar format' },
        { title: 'Tags & Smart Folders', description: 'Organizing with tags and automation' },
        { title: 'Productivity Analytics', description: 'Understanding your work patterns' }
      ]
    },
    {
      title: 'Troubleshooting',
      items: [
        { title: 'Common Issues', description: 'Solutions to frequent problems' },
        { title: 'Performance Tips', description: 'Optimize your BoxLog experience' },
        { title: 'Data Backup', description: 'Keep your data safe' }
      ]
    }
  ]

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Book className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Help & Support</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Find answers and learn how to make the most of BoxLog
        </p>
      </div>

      <div className="space-y-6">
        {helpSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Need more help?</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Can&apos;t find what you&apos;re looking for? Contact our support team.
        </p>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          Contact Support →
        </button>
      </div>
    </div>
  )
}

export function AskPanel() {
  const { state, markAsRead, sendMessage } = useChatContext()
  const isOpen = useAskPanelStore(askPanelSelectors.getIsOpen)
  const collapsed = useAskPanelStore(askPanelSelectors.getCollapsed)
  const currentWidth = useAskPanelStore(askPanelSelectors.getCurrentWidth)
  const { toggleCollapsed, collapse } = useAskPanelStore()
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
        className="h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center transition-all duration-300"
        style={{ width: `${currentWidth}px` }}
      >
        {/* Menu Icons */}
        <div className="flex flex-col items-center px-4 pt-4 space-y-2">
          <button
            onClick={() => handleDirectTabSelect('ai')}
            className="p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group relative"
            title="AI Assistant"
          >
            <Sparkles className="size-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            {state.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">{Math.min(state.unreadCount, 9)}</span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleDirectTabSelect('help')}
            className="p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
            title="Help & Support"
          >
            <HelpCircle className="size-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  // Expanded state - show menu selection or specific tab content
  return (
    <div 
      className="h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300
                 max-lg:fixed max-lg:inset-0 max-lg:z-50"
      style={{ 
        width: isMobile ? '100%' : `${currentWidth}px`
      }}
    >
      {/* Header - only show when specific tab is selected */}
      {!showTabSelection && activeTab !== 'menu' && (
        <AskPanelHeader activeTab={activeTab as 'ai' | 'help'} onTabChange={setActiveTab} onBackToMenu={() => setShowTabSelection(true)} />
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showTabSelection ? (
          // Menu selection screen - sidebar style
          <>
            <div className="flex flex-col h-full w-64">
              {/* Header with collapse button */}
              <div className="flex items-center p-4">
                <button
                  onClick={toggleCollapsed}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  title="Collapse panel"
                >
                  <PanelRight className="size-6" />
                </button>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Assistant</h3>
              </div>
              
              {/* Menu Items - Sidebar style */}
              <div className="flex-1 px-4 pb-4">
                <div className="space-y-2" style={{ maxWidth: '256px' }}>
                  <button
                    onClick={() => handleTabSelect('ai')}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <Sparkles className="size-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">AI Chat</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Ask Claude for help</div>
                    </div>
                    {state.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{Math.min(state.unreadCount, 9)}</span>
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleTabSelect('help')}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <HelpCircle className="size-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Help & Support</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Documentation & guides</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'ai' ? (
          // AI Chat content
          <>
            {state.messages.length === 0 ? (
              <>
                <div className="px-4 py-6">
                  <div className="flex justify-start items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="text-sm leading-relaxed">
                        Hi! I&apos;m Claude, your AI assistant in BoxLog. I can help you with:
                      </div>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• Analyzing your tasks and productivity patterns</li>
                        <li>• Creating and organizing tasks</li>
                        <li>• Scheduling and time management</li>
                        <li>• Answering questions about your data</li>
                      </ul>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        Try one of the quick actions below, or ask me anything!
                      </div>
                    </div>
                  </div>
                </div>
                <AIIntroduction />
              </>
            ) : (
              <div className="px-4 py-6 space-y-6">
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
export function AskPanelToggleButton() {
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
    <Button
      variant="outline"
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 h-auto"
    >
      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      <span className="text-sm font-medium">Ask Claude</span>
      {!isOpen || collapsed ? (
        <ChevronLeft className="w-4 h-4 text-gray-500" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500" />
      )}
    </Button>
  )
}