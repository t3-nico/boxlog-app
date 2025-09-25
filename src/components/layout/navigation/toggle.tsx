'use client'

import { useCallback } from 'react'

import { usePathname } from 'next/navigation'

import { PanelRight } from 'lucide-react'

import { colors } from '@/config/theme'
import { border, secondary, text } from '@/config/theme/colors'

import { useNavigationStore } from '../sidebar/stores/navigation.store'

export const NavigationToggle = () => {
  const pathname = usePathname()
  const { isSecondaryNavCollapsed, setSecondaryNavCollapsed } = useNavigationStore()
  const isSettings = pathname.startsWith('/settings')

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
        className={`rounded-md p-2 transition-colors ${colors.background.surface} border ${border.alpha} shadow-sm ${secondary.hover}`}
        title="Open sidebar"
      >
        <PanelRight className={`h-4 w-4 ${text.muted}`} />
      </button>
    </div>
  )
}
