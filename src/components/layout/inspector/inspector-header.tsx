'use client'

import { useCallback } from 'react'

import { PanelRightClose } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn-ui/tooltip'
import { animations, colors, rounded, spacing, typography } from '@/config/theme'
import { cn } from '@/lib/utils'

import { useInspectorStore } from './stores/inspector.store'

export const InspectorHeader = () => {
  const { toggleInspector } = useInspectorStore()

  const handleToggleInspector = useCallback(() => {
    toggleInspector()
  }, [toggleInspector])

  return (
    <TooltipProvider>
      <div className={cn('flex items-center justify-between', spacing.padding.lg, colors.border.bottom)}>
        {/* Inspector Title */}
        <div className={cn('flex items-center gap-2', colors.text.primary, typography.body.sm, 'font-medium')}>
          <span>詳細情報</span>
        </div>

        {/* Close Inspector Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToggleInspector}
              className={`flex h-8 w-8 items-center justify-center ${rounded.component.button.md} ${colors.hover.subtle} ${animations.transition.fast} flex-shrink-0`}
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
