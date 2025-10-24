'use client'

import { BotMessageSquare, Calendar, ListTodo } from 'lucide-react'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { useInspectorStore } from '@/features/inspector/stores/useInspectorStore'
import { InspectorAIChat } from './inspector-ai-chat'
import { InspectorContent } from './inspector-content'
import { UnscheduledTasksList } from './UnscheduledTasksList'

export function MobileInspectorSheet() {
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const setInspectorOpen = useInspectorStore((state) => state.setInspectorOpen)

  return (
    <Sheet open={isInspectorOpen} onOpenChange={setInspectorOpen}>
      <SheetContent side="bottom" className={cn('flex h-[85vh] max-h-[85vh] flex-col', 'gap-0 p-0')}>
        <SheetHeader className="flex-shrink-0 px-4 pt-4 pb-0">
          <SheetTitle>インスペクター</SheetTitle>
          <SheetDescription>選択した日付やイベントの詳細を表示します</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4">
          <Tabs defaultValue="overview" className="mt-4 flex min-h-0 flex-1 flex-col">
            <TabsList className="grid w-full flex-shrink-0 grid-cols-3">
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

            <div className="min-h-0 flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full overflow-y-auto">
                <InspectorContent />
              </TabsContent>
              <TabsContent value="ai" className="h-full overflow-y-auto">
                <InspectorAIChat />
              </TabsContent>
              <TabsContent value="tasks" className="h-full overflow-y-auto">
                <UnscheduledTasksList />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
