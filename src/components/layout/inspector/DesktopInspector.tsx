'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { PanelRightClose, Calendar, ListTodo, BotMessageSquare } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/shadcn-ui/tabs'
import { colors, rounded, animations, layout, primary } from '@/config/theme'
import { cn } from '@/lib/utils'

import { InspectorAIChat } from './inspector-ai-chat'
import { InspectorContent } from './inspector-content'
import { useInspectorStore } from './stores/inspector.store'


import { UnscheduledTasksList } from './UnscheduledTasksList'

const { xs } = layout.heights.header

export const DesktopInspector = () => {
  const _pathname = usePathname()
  const inspectorWidth = useInspectorStore((state) => state.inspectorWidth)
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const setInspectorWidthConstrained = useInspectorStore((state) => state.setInspectorWidthConstrained)
  const { toggleInspector } = useInspectorStore()

  const handleMouseDown = (e: React.MouseEvent) => {
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
  }
  
  if (!isInspectorOpen) {
    return null
  }
  
  return (
    <div 
      className={cn(
        'flex relative z-[9999] border-l',
        colors.background.surface,
        colors.text.primary,
        colors.border.default
      )}
      style={{ width: `${inspectorWidth}px` }}
    >
      {/* Resize Handle - 左側 */}
      <div
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
          }
        }}
        className={cn(
          'absolute -left-1 top-0 w-3 h-full cursor-ew-resize group'
        )}
        role="button"
        tabIndex={0}
        aria-label="インスペクターの幅を調整"
      >
        {/* Visual Color Change - 1px width */}
        <div className={cn(
          'absolute left-1 top-0 w-px h-full transition-colors',
          `bg-transparent ${primary.hover.replace('hover:', 'group-hover:')}`
        )} />
      </div>

      {/* Inspector Content */}
      <div className="flex-1 flex flex-col">
        {/* Inspector Header with Close Button */}
        <div className={cn(
          'flex items-center justify-end px-2 mt-2',
          xs, // 32px height
          colors.background.surface
        )}>
          <button
            type="button"
            onClick={() => toggleInspector()}
            className={cn(
              'w-8 h-8 flex items-center justify-center',
              rounded.component.button.sm,
              animations.transition.fast,
              colors.ghost.text,
              colors.hover.ghost,
              'flex-shrink-0'
            )}
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </div>

        {/* Inspector Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <div className={cn("px-2 pb-2 border-b", colors.border.default)}>
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
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="p-0 m-0">
              <InspectorContent />
            </TabsContent>
            <TabsContent value="ai" className="p-0 m-0 h-full">
              <InspectorAIChat />
            </TabsContent>
            <TabsContent value="tasks" className="p-0 m-0 h-full">
              <UnscheduledTasksList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}