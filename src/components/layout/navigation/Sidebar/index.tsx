'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/config/navigation/config'
import { useNavigationStore } from '../stores/navigation.store'
import { PageContent } from './page-content'
import { BottomContent } from './bottom-content'
import { SettingsNavigation } from './settings-navigation'
import { PanelLeft } from 'lucide-react'
import { background, border, secondary, text } from '@/config/theme/colors'
import { icon } from '@/config/theme/icons'
import { heading } from '@/config/theme/typography'

export { SidebarToggle as SecondaryNavToggle } from './toggle'

const SidebarHeader = React.memo(({ title }: { title: string }) => {
  return (
    <div className="flex-shrink-0 mb-4">
      <h1 className={heading.h1}>
        {title}
      </h1>
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'

export function Sidebar() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const isSettings = pathname.startsWith('/settings')
  const isCalendar = pathname.startsWith('/calendar')
  const { setSecondaryNavCollapsed } = useNavigationStore()

  return (
    <div className={`w-64 lg:w-64 md:w-56 sm:w-full ${background.surface} border-r ${border.universal}`}>
      <div className="h-full flex flex-col p-4">
        {!isSettings ? (
          <>
            {/* Page Title */}
            <SidebarHeader title={isCalendar ? 'Calendar' : pageTitle} />
            
            {/* Page-specific Content */}
            <PageContent pathname={pathname} />
            
            {/* Bottom Content (Schedule Card, etc.) - 除外: カレンダーページ */}
            {!isCalendar && <BottomContent />}
          </>
        ) : (
          <>
            {/* Settings Navigation */}
            <SidebarHeader title="Settings" />
            <SettingsNavigation />
          </>
        )}
        
        {/* Close Button - Bottom Left */}
        <div className="flex-shrink-0 mt-auto">
          <button
            onClick={() => setSecondaryNavCollapsed(true)}
            className={`p-2 rounded-md transition-colors ${secondary.hover}`}
            title="Close sidebar"
          >
            <PanelLeft className={`${icon.size.md} ${text.muted}`} />
          </button>
        </div>
      </div>
    </div>
  )
}