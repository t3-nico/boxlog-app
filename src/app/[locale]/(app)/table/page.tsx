'use client'

import { useChatStore } from '@/features/aichat/stores/useChatStore'
import { TaskTable } from '@/features/table'
import { cn } from '@/lib/utils'

const TablePage = () => {
  const { toggleChat: _toggleChat, isOpen } = useChatStore()

  return (
    <div className="relative flex h-full flex-col">
      <div className={cn('flex-1 p-6 transition-all duration-300', isOpen && 'mr-96')}>
        <div className="mx-auto max-w-screen-2xl">
          <TaskTable />
        </div>
      </div>
    </div>
  )
}

export default TablePage
