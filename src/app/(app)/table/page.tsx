'use client'

import { useState } from 'react'
import { TableCellsIcon } from '@heroicons/react/24/outline'
import { Heading } from '@/components/heading'
import { useChatContext } from '@/contexts/chat-context'

export default function Table() {
  const { toggleChat, state } = useChatContext()

  return (
    <div className="flex flex-col h-full relative">
      <div className={`flex-1 p-10 transition-all duration-300 ${state.isOpen ? 'mr-80' : ''}`}>
        <div className="mx-auto max-w-6xl">
          <Heading>Table View</Heading>
          <div className="mt-8 flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Table view coming soon</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This feature is under development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}