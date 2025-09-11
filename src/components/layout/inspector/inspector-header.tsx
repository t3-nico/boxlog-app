'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useInspectorStore } from './stores/inspector.store'
import { componentRadius, animations } from '@/config/theme'
import { background, text, border, secondary } from '@/config/theme/colors'
import { PanelRightClose } from 'lucide-react'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip'

export function InspectorHeader() {
  const { toggleInspector } = useInspectorStore()
  
  return (
    <TooltipProvider>
      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-b',
        border.subtle
      )}>
        {/* Inspector Title */}
        <div className={cn(
          'flex items-center gap-2',
          text.primary,
          'font-medium text-sm'
        )}>
          <span>詳細情報</span>
        </div>

        {/* Close Inspector Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleInspector()}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex-shrink-0"
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