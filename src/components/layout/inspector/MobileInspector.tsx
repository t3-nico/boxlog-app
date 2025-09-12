'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { X, Calendar, ListTodo, BotMessageSquare } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/shadcn-ui/tabs'
import { colors, rounded, animations, icons } from '@/config/theme'
import { cn } from '@/lib/utils'

import { InspectorAIChat } from './inspector-ai-chat'
import { InspectorContent } from './inspector-content'
import { useInspectorStore } from './stores/inspector.store'


import { UnscheduledTasksList } from './UnscheduledTasksList'

const { sm } = icons.size

export const MobileInspector = () => {
  const pathname = usePathname()
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const { toggleInspector } = useInspectorStore()

  // キーボードナビゲーション強化
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isInspectorOpen) {
      toggleInspector()
    }
  }

  if (!isInspectorOpen) {
    return null
  }

  return (
    <>
      {/* Background Overlay */}
      <div 
        className={cn(
          'fixed inset-0 z-[9998]',
          'bg-black bg-opacity-50',
          animations.appear.fadeIn
        )}
        onClick={() => toggleInspector()}
      />
      
      {/* Mobile Inspector Content */}
      <div 
        className={cn(
          'fixed inset-0 z-[9999]',
          'flex flex-col',
          'overflow-hidden', // コンテナ自体のスクロールを防ぐ
          colors.background.surface,
          colors.text.primary,
          animations.appear.slideUp
        )}
        onKeyDown={handleKeyDown}
        aria-label="インスペクター"
        aria-modal="true"
        role="dialog"
      >
        {/* Mobile Inspector Header with Close Button */}
        <div className={cn(
          'flex items-center justify-start p-4',
          'border-b',
          colors.border.default,
          colors.background.surface
        )}>
          <button
            onClick={() => toggleInspector()}
            className={cn(
              'w-10 h-10 flex items-center justify-center',
              rounded.component.button.sm,
              animations.transition.fast,
              colors.hover.subtle,
              'flex-shrink-0'
            )}
            aria-label="インスペクターを閉じる"
          >
            <X className={sm} />
          </button>
        </div>

        {/* Inspector Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className={cn("px-4 pb-2 border-b flex-shrink-0", colors.border.default)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                概要
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1">
                <BotMessageSquare className="w-4 h-4" />
                AI
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <ListTodo className="w-4 h-4" />
                タスク
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="overview" className="p-0 m-0 h-full overflow-y-auto">
              <InspectorContent />
            </TabsContent>
            <TabsContent value="ai" className="p-0 m-0 h-full overflow-y-auto">
              <InspectorAIChat />
            </TabsContent>
            <TabsContent value="tasks" className="p-0 m-0 h-full overflow-y-auto">
              <UnscheduledTasksList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  )
}