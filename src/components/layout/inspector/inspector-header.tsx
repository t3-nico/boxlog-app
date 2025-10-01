'use client'

import { useCallback } from 'react'

import { PanelRightClose } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn-ui/tooltip'
import { cn } from '@/lib/utils'

import { useInspectorStore } from './stores/inspector.store'

export const InspectorHeader = () => {
  const { toggleInspector } = useInspectorStore()

  const handleToggleInspector = useCallback(() => {
    toggleInspector()
  }, [toggleInspector])

  return (
    <TooltipProvider>
      <div className={cn('flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800')}>
        {/* Inspector Title */}
        <div className={cn('flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100')}>
          <span>詳細情報</span>
        </div>

        {/* Close Inspector Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToggleInspector}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md transition-fast',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'flex-shrink-0'
              )}
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Inspectorを閉じる</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
