'use client'

import { useState } from 'react'
import { Heading } from '@/components/heading'
import { useChatContext } from '@/contexts/chat-context'
import { TaskTable } from '@/components/box/task-table'

export default function Table() {
  const { toggleChat, state } = useChatContext()

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 p-10 transition-all duration-300 ${state.isOpen ? 'mr-80' : ''}`}>
        <div className="mx-auto max-w-6xl">
          <TaskTable />
        </div>
      </div>
    </div>
  )
}