'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { PanelLeftOpen, Menu } from 'lucide-react'
import { useNavigationStore } from '../sidebar/stores/navigation.store'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { componentRadius, animations, icon } from '@/config/theme'
import { ghost } from '@/config/theme/colors'

const { sm } = icon.size

export function SidebarToggle() {
  const { toggleSidebar } = useNavigationStore()
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <button
      onClick={() => toggleSidebar()}
      className={cn(
        'w-8 h-8 flex items-center justify-center mr-4',
        componentRadius.button.sm,
        animations.transition.fast,
        ghost.text,
        ghost.hover,
        ghost.active,
        'flex-shrink-0'
      )}
      title="サイドバーを開く"
    >
      {/* モバイル：ハンバーガーメニュー、デスクトップ：パネルアイコン */}
      {isMobile ? <Menu className={sm} /> : <PanelLeftOpen className={sm} />}
    </button>
  )
}