'use client'

import { useCallback, useState } from 'react'

import { Copy, HelpCircle, MoreVertical, Sparkles, Trash2, X } from 'lucide-react'

import { useChatStore } from '@/features/aichat/stores/useChatStore'
import { cn } from '@/lib/utils'

import { useAskPanelStore } from '../stores/useAskPanelStore'

interface AskPanelHeaderProps {
  activeTab: 'ai' | 'help'
  onTabChange: (tab: 'ai' | 'help' | 'menu') => void
  onBackToMenu: () => void
}

export const AskPanelHeader = ({ activeTab }: AskPanelHeaderProps) => {
  const { clearMessages } = useChatStore()
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

  const handleMenuToggle = useCallback(() => {
    setShowMenu(!showMenu)
  }, [showMenu])

  const handleClearMessages = useCallback(() => {
    clearMessages()
    setShowMenu(false)
  }, [clearMessages])

  const handleExportConversation = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify({}))
    setShowMenu(false)
  }, [])

  return (
    <div className="border-border flex-shrink-0 border-b">
      {/* Header with collapse button and active tab info */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn('h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center', activeTabData.color)}
            >
              <activeTabData.icon className="h-4 w-4 text-white" />
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
                  onClick={handleMenuToggle}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded p-2 transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu != null && (
                  <div className="bg-card border-border absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={handleClearMessages}
                      className="text-card-foreground hover:bg-accent/50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear conversation
                    </button>
                    <button
                      type="button"
                      onClick={handleExportConversation}
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
