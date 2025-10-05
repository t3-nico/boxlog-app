'use client'

import { cn } from '@/lib/utils'
import { useChatContext } from '@/contexts/chat-context'
import { TaskTable } from '@/features/table'

const TablePage = () => {
  const { toggleChat: _toggleChat, state } = useChatContext()

  return (
    <div className="flex flex-col h-full relative">
      <div className={cn(
        'flex-1 p-6 transition-all duration-300',
        state.isOpen && 'mr-96'
      )}>
        <div className="mx-auto max-w-screen-2xl">
          <TaskTable />
        </div>
      </div>
    </div>
  )
}

export default TablePage