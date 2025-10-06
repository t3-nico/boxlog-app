'use client'

import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { SettingsNavigation } from '@/features/settings/components/settings-navigation'

import { BottomContent } from '../navigation/bottom-content'
import { PageContent } from '../navigation/page-content'

/**
 * DefaultSidebar - デフォルトのサイドバーコンテンツ
 * 既存のSecondaryNavigationの内容を移植
 */
export const DefaultSidebar = () => {
  const pathname = usePathname() || '/'
  const isSettings = pathname.startsWith('/settings')
  const isCalendar = pathname.startsWith('/calendar')

  return (
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
  )
}
