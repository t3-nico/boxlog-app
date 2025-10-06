'use client'

import { useCallback } from 'react'

import { Menu, PanelLeftOpen } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

import { useNavigationStore } from '../appbar/stores/navigation.store'

export const SidebarToggle = () => {
  const { toggleSidebar } = useNavigationStore()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleToggleSidebar}
            className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center',
              'rounded-sm',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'transition-all duration-200'
            )}
          >
            {/* モバイル：ハンバーガーメニュー、デスクトップ：パネルアイコン */}
            {isMobile ? <Menu className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>サイドバーを開く</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
