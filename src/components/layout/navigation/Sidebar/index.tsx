'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/components/layout/navigation/navigation/config'
import { useNavigationStore } from '@/features/navigation/stores/navigation.store'
import { PageContent } from './page-content'
import { BottomContent } from './bottom-content'
import { SettingsNavigation } from './settings-navigation'
import { PanelLeft } from 'lucide-react'
import { background, border } from '@/config/theme/colors'
import { icon } from '@/config/theme/icons'
import { heading } from '@/config/theme/typography'

export { SidebarToggle as SecondaryNavToggle } from './toggle'

const SidebarHeader = React.memo(({ title }: { title: string }) => {
  const { setSecondaryNavCollapsed } = useNavigationStore()

  return (
    <div className="flex-shrink-0 mb-4">
      <div className="flex items-center justify-between">
        <h1 className={heading.h1}>
          {title}
        </h1>
        
        <button
          onClick={() => setSecondaryNavCollapsed(true)}
          className="p-1 rounded-md hover:bg-accent/50 transition-colors"
          title="Close sidebar"
        >
          <PanelLeft className={`${icon.size.md} text-muted-foreground`} />
        </button>
      </div>
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'

export function Sidebar() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const isSettings = pathname.startsWith('/settings')
  const isCalendar = pathname.startsWith('/calendar')

  return (
    <div className={`w-64 ${background.surface} border-r ${border.DEFAULT}`}>
      <div className="h-full flex flex-col p-4">
        {!isSettings ? (
          <>
            {/* Page Title & Close Button (簡潔表示: カレンダーページ) */}
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
      </div>
    </div>
  )
}