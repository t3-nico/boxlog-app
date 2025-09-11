'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { PanelLeftOpen, Menu } from 'lucide-react'
import { useNavigationStore } from '../sidebar/stores/navigation.store'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { componentRadius, animations, icon } from '@/config/theme'
import { ghost, secondary } from '@/config/theme/colors'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip'

const { sm } = icon.size

export function SidebarToggle() {
  const { toggleSidebar } = useNavigationStore()
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => toggleSidebar()}
            className={cn(
              'w-8 h-8 flex items-center justify-center flex-shrink-0',
              componentRadius.button.sm,
              secondary.hover,
              animations.transition.fast
            )}
          >
            {/* モバイル：ハンバーガーメニュー、デスクトップ：パネルアイコン */}
            {isMobile ? <Menu className={sm} /> : <PanelLeftOpen className={sm} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>サイドバーを開く</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}