'use client'

import { Menu, PanelLeftOpen } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcn-ui/tooltip'
import { animations, componentRadius, icon } from '@/config/theme'
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
            type="button"
            onClick={() => toggleSidebar()}
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center',
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
