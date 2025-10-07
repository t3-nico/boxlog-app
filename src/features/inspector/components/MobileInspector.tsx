'use client'

import React, { useCallback } from 'react'


import { BotMessageSquare, Calendar, ListTodo, X } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { InspectorAIChat } from './inspector-ai-chat'
import { InspectorContent } from './inspector-content'
import { useInspectorStore } from '@/features/inspector/stores/inspector.store'
import { UnscheduledTasksList } from './UnscheduledTasksList'

export const MobileInspector = () => {
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const { toggleInspector } = useInspectorStore()

  // キーボードナビゲーション強化
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isInspectorOpen) {
        toggleInspector()
      }
    },
    [isInspectorOpen, toggleInspector]
  )

  const handleToggleInspector = useCallback(() => {
    toggleInspector()
  }, [toggleInspector])

  const handleOverlayKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggleInspector()
      }
    },
    [toggleInspector]
  )

  if (!isInspectorOpen) {
    return null
  }

  return (
    <>
      {/* Background Overlay */}
      <div
        className={cn('fixed inset-0 z-[9998] bg-black bg-opacity-50 animate-in fade-in')}
        onClick={handleToggleInspector}
        onKeyDown={handleOverlayKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close inspector"
      />

      {/* Mobile Inspector Content */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className={cn(
          'fixed inset-0 z-[9999]',
          'flex flex-col',
          'overflow-hidden',
          'bg-white dark:bg-neutral-800',
          'text-neutral-900 dark:text-neutral-100',
          'animate-in slide-in-from-bottom'
        )}
        onKeyDown={handleKeyDown}
        aria-label="インスペクター"
        aria-modal="true"
        role="dialog"
      >
        {/* Mobile Inspector Header with Close Button */}
        <div
          className={cn(
            'flex items-center justify-start p-4',
            'border-b border-neutral-200 dark:border-neutral-800',
            'bg-white dark:bg-neutral-800'
          )}
        >
          <button
            type="button"
            onClick={handleToggleInspector}
            className={cn(
              'flex h-10 w-10 items-center justify-center',
              'rounded-sm',
              'transition-fast',
              'hover:bg-neutral-100 dark:hover:bg-neutral-700',
              'flex-shrink-0'
            )}
            aria-label="インスペクターを閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inspector Tabs */}
        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
          <div className={cn('flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 px-4 pb-2')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                概要
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1">
                <BotMessageSquare className="h-4 w-4" />
                AI
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1">
                <ListTodo className="h-4 w-4" />
                タスク
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <TabsContent value="overview" className="m-0 h-full overflow-y-auto p-0">
              <InspectorContent />
            </TabsContent>
            <TabsContent value="ai" className="m-0 h-full overflow-y-auto p-0">
              <InspectorAIChat />
            </TabsContent>
            <TabsContent value="tasks" className="m-0 h-full overflow-y-auto p-0">
              <UnscheduledTasksList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  )
}
