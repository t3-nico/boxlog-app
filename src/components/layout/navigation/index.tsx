'use client'

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
    <div
      className={`relative z-50 w-64 sm:w-full md:w-56 lg:w-64 ${colors.background.base} border-r ${border.universal}`}
    >
      <div className="flex h-full flex-col p-4">
        {!isSettings ? (
          <>
            {/* Page-specific Content */}
            <PageContent pathname={pathname} />

            {/* Bottom Content (Schedule Card, etc.) - 除外: カレンダーページ */}
            {!isCalendar ? <BottomContent /> : null}
          </>
        ) : (
          <SettingsNavigation />
        )}
      </div>
    </div>
  )
}
