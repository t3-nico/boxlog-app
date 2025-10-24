'use client'

import { useCallback } from 'react'

import { PanelRightOpen } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useInspectorStore } from '@/features/inspector/stores/useInspectorStore'
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
    <div className="flex h-10 items-center justify-end">
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggleInspector}
            className={cn(
              'flex h-8 w-8 items-center justify-center',
              'rounded-sm',
              'transition-all duration-200',
              'text-muted-foreground',
              'hover:bg-accent',
              'active:text-foreground',
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
  )
}
