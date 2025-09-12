'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { border } from '@/config/theme/colors'
import { SettingsNavigation } from '@/features/settings/components/settings-navigation'

import { BottomContent } from './bottom-content'
import { PageContent } from './page-content'
export { NavigationToggle as SecondaryNavToggle } from './toggle'

export const Navigation = () => {
  const pathname = usePathname()
  const isSettings = pathname.startsWith('/settings')
  const isCalendar = pathname.startsWith('/calendar')

  return (
    <div className={`w-64 lg:w-64 md:w-56 sm:w-full relative z-50 ${colors.background.base} border-r ${border.universal}`}>
      <div className="h-full flex flex-col p-4">
        {!isSettings ? (
          <>
            
            {/* Page-specific Content */}
            <PageContent pathname={pathname} />
            
            {/* Bottom Content (Schedule Card, etc.) - 除外: カレンダーページ */}
            {!isCalendar && <BottomContent />}
          </>
        ) : (
          <SettingsNavigation />
        )}
      </div>
    </div>
  )
}