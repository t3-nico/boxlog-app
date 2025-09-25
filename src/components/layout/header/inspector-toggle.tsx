'use client'

import { useCallback } from 'react'

import { PanelRightOpen } from 'lucide-react'

import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn-ui/tooltip'
import { animations, componentRadius, icon, layout } from '@/config/theme'
import { ghost, secondary } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

const { compact } = layout.heights.header
const { sm } = icon.size

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
      <div
        className={cn(
          'flex items-center justify-end',
          compact // 40px height
        )}
      >
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToggleInspector}
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                componentRadius.button.sm,
                animations.transition.fast,
                ghost.text,
                secondary.hover,
                ghost.active,
                'flex-shrink-0'
              )}
            >
              <PanelRightOpen className={sm} />
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
