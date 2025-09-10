'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { PanelLeftOpen } from 'lucide-react'
import { useNavigationStore } from '../sidebar/stores/navigation.store'
import { componentRadius, animations, icon } from '@/config/theme'
import { ghost } from '@/config/theme/colors'

const { sm } = icon.size

export function SidebarToggle() {
  const { toggleSidebar } = useNavigationStore()

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
      <PanelLeftOpen className={sm} />
    </button>
  )
}