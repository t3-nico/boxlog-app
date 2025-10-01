'use client'

import { useCallback } from 'react'

import { PanelRightOpen } from 'lucide-react'

import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn-ui/tooltip'
import { cn } from '@/lib/utils'

export const InspectorToggle = () => {
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const { toggleInspector } = useInspectorStore()

  const handleToggleInspector = useCallback(() => {
    toggleInspector()
  }, [toggleInspector])

  // Inspectorが開いている場合は何も表示しない
  if (isInspectorOpen) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-end h-10">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToggleInspector}
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'rounded-sm',
                'transition-all duration-200',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                'active:text-neutral-900 dark:active:text-neutral-100',
                'flex-shrink-0'
              )}
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Inspectorを開く</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
