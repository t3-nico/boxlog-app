'use client'

import { BarChart3 } from 'lucide-react'

import { Heading } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/features/aichat/stores/useChatStore'

const StatsPage = () => {
  const { state } = useChatStore()

  return (
    <div className="flex flex-col h-full relative">
      <div className={cn(
        'flex-1 p-6 transition-all duration-300',
        state.isOpen && 'mr-96'
      )}>
        <div className="mx-auto max-w-7xl">
          <Heading>Stats View</Heading>
          <div className="mt-8 flex items-center justify-center h-64 bg-neutral-200 dark:bg-neutral-700 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-neutral-600 dark:text-neutral-400" />
              <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">Statistics view coming soon</h3>
              <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">
                This feature is under development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPage