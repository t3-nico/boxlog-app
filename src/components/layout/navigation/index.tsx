'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { PageContent } from './page-content'
import { BottomContent } from './bottom-content'
import { SettingsNavigation } from '@/features/settings/components/settings-navigation'
import { background, border } from '@/config/theme/colors'
export { NavigationToggle as SecondaryNavToggle } from './toggle'

export function Navigation() {
  const pathname = usePathname()
  const isSettings = pathname.startsWith('/settings')
  const isCalendar = pathname.startsWith('/calendar')

  return (
    <div className={`w-64 lg:w-64 md:w-56 sm:w-full relative z-50 ${background.base} border-r ${border.universal}`}>
      <div className="h-full flex flex-col p-4">
        {!isSettings ? (
          <>
            
            {/* Page-specific Content */}
            <PageContent pathname={pathname} />
            
            {/* Bottom Content (Schedule Card, etc.) - 除外: カレンダーページ */}
            {!isCalendar && <BottomContent />}
          </>
        ) : (
          <>
            <SettingsNavigation />
          </>
        )}
      </div>
    </div>
  )
}