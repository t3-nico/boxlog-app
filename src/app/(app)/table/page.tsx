'use client'

import { spacing, layout } from '@/config/theme'
import { useChatContext } from '@/contexts/chat-context'
import { TaskTable } from '@/features/table'

export default function TablePage() {
  const { toggleChat, state } = useChatContext()

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 ${spacing.page.default} transition-all duration-300 ${state.isOpen ? layout.chat.offset : ''}`}>
        <div className={layout.content}>
          <TaskTable />
        </div>
      </div>
    </div>
  )
}