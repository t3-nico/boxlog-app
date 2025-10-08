'use client'

import React, { useCallback } from 'react'

import { BotMessageSquare, Calendar, ListTodo, PanelRightClose } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { useInspectorStore } from '@/features/inspector/stores/inspector.store'
import { InspectorAIChat } from './inspector-ai-chat'
import { InspectorContent } from './inspector-content'

import { UnscheduledTasksList } from './UnscheduledTasksList'

export const DesktopInspector = () => {
  const inspectorWidth = useInspectorStore((state) => state.inspectorWidth)
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const setInspectorWidthConstrained = useInspectorStore((state) => state.setInspectorWidthConstrained)
  const { toggleInspector } = useInspectorStore()

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const startX = e.clientX
      const startWidth = useInspectorStore.getState().inspectorWidth

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth - (e.clientX - startX) // 右から左なので符号反転

        // 制約付き幅設定メソッドを使用
        setInspectorWidthConstrained(newWidth)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [setInspectorWidthConstrained]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
    }
  }, [])

  const handleToggleInspector = useCallback(() => {
    toggleInspector()
  }, [toggleInspector])

  if (!isInspectorOpen) {
    return null
  }

  return (
    <div
      className={cn(
        'relative z-[9999] flex border-l',
        'bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-neutral-100',
        'border-neutral-200 dark:border-neutral-800'
      )}
      style={{ width: `${inspectorWidth}px` }}
    >
      {/* Resize Handle - 左側 */}
      <div
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        className={cn('group absolute top-0 -left-1 h-full w-3 cursor-ew-resize')}
        role="button"
        tabIndex={0}
        aria-label="インスペクターの幅を調整"
      >
        {/* Visual Color Change - 1px width */}
        <div
          className={cn('absolute top-0 left-1 h-full w-px transition-colors', 'group-hover:bg-primary bg-transparent')}
        />
      </div>

      {/* Inspector Content */}
      <div className="flex flex-1 flex-col">
        {/* Inspector Header with Close Button */}
        <div
          className={cn(
            'mt-2 flex items-center justify-end px-2',
            'h-8', // 32px height
            'bg-white dark:bg-neutral-800'
          )}
        >
          <button
            type="button"
            onClick={handleToggleInspector}
            className={cn(
              'flex h-8 w-8 items-center justify-center',
              'rounded-sm',
              'transition-fast',
              'text-neutral-600 dark:text-neutral-400',
              'hover:bg-neutral-100 dark:hover:bg-neutral-700',
              'flex-shrink-0'
            )}
          >
            <PanelRightClose className="h-5 w-5" />
          </button>
        </div>

        {/* Inspector Tabs */}
        <Tabs defaultValue="overview" className="flex flex-1 flex-col">
          <div className={cn('border-b border-neutral-200 px-2 pb-2 dark:border-neutral-800')}>
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

          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="m-0 p-0">
              <InspectorContent />
            </TabsContent>
            <TabsContent value="ai" className="m-0 h-full p-0">
              <InspectorAIChat />
            </TabsContent>
            <TabsContent value="tasks" className="m-0 h-full p-0">
              <UnscheduledTasksList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
