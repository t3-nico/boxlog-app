'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import { componentRadius, animations, layout, icon } from '@/config/theme'
import { ghost, secondary } from '@/config/theme/colors'
import { PanelRightOpen } from 'lucide-react'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip'

const { compact } = layout.heights.header
const { sm } = icon.size

export function InspectorToggle() {
  const isInspectorOpen = useInspectorStore((state) => state.isInspectorOpen)
  const { toggleInspector } = useInspectorStore()

  // Inspectorが開いている場合は何も表示しない
  if (isInspectorOpen) {
    return null
  }

  return (
    <TooltipProvider>
      <div className={cn(
        'flex items-center justify-end',
        compact // 40px height
      )}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleInspector()}
              className={cn(
                'w-8 h-8 flex items-center justify-center',
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