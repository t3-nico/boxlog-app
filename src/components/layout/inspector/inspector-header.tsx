'use client'

import React from 'react'

import { PanelRightClose } from 'lucide-react'

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip'
import { rounded, animations, colors, typography, spacing } from '@/config/theme'
import { cn } from '@/lib/utils'

import { useInspectorStore } from './stores/inspector.store'


export const InspectorHeader = () => {
  const { toggleInspector } = useInspectorStore()
  
  return (
    <TooltipProvider>
      <div className={cn(
        'flex items-center justify-between',
        spacing.padding.lg,
        colors.border.bottom
      )}>
        {/* Inspector Title */}
        <div className={cn(
          'flex items-center gap-2',
          colors.text.primary,
          typography.body.sm,
          'font-medium'
        )}>
          <span>詳細情報</span>
        </div>

        {/* Close Inspector Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleInspector()}
              className={`w-8 h-8 flex items-center justify-center ${rounded.component.button.md} ${colors.hover.subtle} ${animations.transition.fast} flex-shrink-0`}
            >
              <PanelRightClose className="w-4 h-4" />
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