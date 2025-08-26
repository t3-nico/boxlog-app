'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '../stores/navigation.store'
import { PanelRight } from 'lucide-react'
import { background, border, secondary, text } from '@/config/theme/colors'

export function SidebarToggle() {
  const pathname = usePathname()
  const { isSecondaryNavCollapsed, setSecondaryNavCollapsed } = useNavigationStore()
  const isSettings = pathname.startsWith('/settings')

  // Only show when collapsed and not in settings
  if (!isSecondaryNavCollapsed || isSettings) {
    return null
  }

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <button
        onClick={() => setSecondaryNavCollapsed(false)}
        className={`p-2 rounded-md transition-colors ${background.surface} border ${border.alpha} shadow-sm ${secondary.hover}`}
        title="Open sidebar"
      >
        <PanelRight className={`w-4 h-4 ${text.muted}`} />
      </button>
    </div>
  )
}