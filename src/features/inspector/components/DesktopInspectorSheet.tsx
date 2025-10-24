'use client'

import React, { useCallback } from 'react'

import { BotMessageSquare, Calendar, ListTodo } from 'lucide-react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { useInspectorStore } from '@/features/inspector/stores/useInspectorStore'
import { InspectorAIChat } from './inspector-ai-chat'
import { InspectorContent } from './inspector-content'
import { UnscheduledTasksList } from './UnscheduledTasksList'

export function DesktopInspectorSheet() {
  const inspectorWidth = useInspectorStore((state) => state.inspectorWidth)
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const setInspectorOpen = useInspectorStore((state) => state.setInspectorOpen)
  const setInspectorWidthConstrained = useInspectorStore((state) => state.setInspectorWidthConstrained)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const startX = e.clientX
      const startWidth = useInspectorStore.getState().inspectorWidth

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth - (e.clientX - startX)
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

  return (
    <Sheet open={isInspectorOpen} onOpenChange={setInspectorOpen}>
      <SheetContent side="right" className={cn('gap-0 p-0')} style={{ width: `${inspectorWidth}px` }}>
        {/* リサイズハンドル */}
        <div
          onMouseDown={handleMouseDown}
          className="hover:bg-primary/20 absolute top-0 -left-1 z-50 h-full w-2 cursor-ew-resize"
          aria-label="インスペクターの幅を調整"
        />

        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle>インスペクター</SheetTitle>
          <SheetDescription>選択した日付やイベントの詳細を表示します</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4 px-4">
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

          <TabsContent value="overview" className="mt-4">
            <InspectorContent />
          </TabsContent>
          <TabsContent value="ai" className="mt-4">
            <InspectorAIChat />
          </TabsContent>
          <TabsContent value="tasks" className="mt-4">
            <UnscheduledTasksList />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
