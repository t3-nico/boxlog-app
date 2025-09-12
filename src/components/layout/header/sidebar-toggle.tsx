'use client'

import React from 'react'

import { PanelLeftOpen, Menu } from 'lucide-react'

import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/shadcn-ui/tooltip'
import { componentRadius, animations, icon } from '@/config/theme'
import { secondary } from '@/config/theme/colors'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

import { useNavigationStore } from '../sidebar/stores/navigation.store'


const { sm } = icon.size

export const SidebarToggle = () => {
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