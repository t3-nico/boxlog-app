'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useNavigationStore } from '../stores/navigation.store'
import { PanelRight } from 'lucide-react'

export function SecondaryNavToggle() {
  const pathname = usePathname()
  const { isSecondaryNavCollapsed, setSecondaryNavCollapsed } = useNavigationStore()
  const isSettings = pathname.startsWith('/settings')

  // Only show when collapsed and not in settings
  if (!isSecondaryNavCollapsed || isSettings) {
    return null
  }

  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={() => setSecondaryNavCollapsed(false)}
        className="p-2 rounded-md hover:bg-accent/50 transition-colors bg-background border border-border shadow-sm"
        title="Open sidebar"
      >
        <PanelRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  )
}