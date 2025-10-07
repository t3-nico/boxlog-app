'use client'

import { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { PanelRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useNavigationStore } from '../stores/navigation.store'

export const NavigationToggle = () => {
  const pathname = usePathname()
  const { isSecondaryNavCollapsed, setSecondaryNavCollapsed } = useNavigationStore()
  const isSettings = (pathname || "/").startsWith('/settings')

  // jsx-no-bind optimization: Toggle navigation handler
  const handleToggleNavigation = useCallback(() => {
    setSecondaryNavCollapsed(false)
  }, [setSecondaryNavCollapsed])

  // Only show when collapsed and not in settings
  if (!isSecondaryNavCollapsed || isSettings) {
    return null
  }

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <button
        type="button"
        onClick={handleToggleNavigation}
        className={cn(
          'rounded-md p-2 transition-colors',
          'bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50',
          'shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700'
        )}
        title="Open sidebar"
      >
        <PanelRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      </button>
    </div>
  )
}
