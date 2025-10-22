'use client'

import { useCallback } from 'react'

import { PanelRightClose } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { useInspectorStore } from '@/features/inspector/stores/inspector.store'

export const InspectorHeader = () => {
  const { toggleInspector } = useInspectorStore()

  const handleToggleInspector = useCallback(() => {
    toggleInspector()
  }, [toggleInspector])

  return (
    <div className={cn('border-border flex items-center justify-between border-b p-6')}>
      {/* Inspector Title */}
      <div className={cn('text-foreground flex items-center gap-2 text-sm font-medium')}>
        <span>詳細情報</span>
      </div>

      {/* Close Inspector Button */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggleInspector}
            className={cn(
              'transition-fast flex h-8 w-8 items-center justify-center rounded-md',
              'hover:bg-accent',
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
  )
}
