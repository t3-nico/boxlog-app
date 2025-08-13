'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/lib/navigation/config'
import { useNavigationStore } from '@/store/navigation.store'
import { SecondaryNavHeader } from './header'
import { PageContent } from './page-content'
import { BottomContent } from './bottom-content'
import { SettingsNavigation } from './settings-navigation'

export { SecondaryNavToggle } from './toggle'

export function SecondaryNavigation() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const isSettings = pathname.startsWith('/settings')

  return (
    <div className="w-64 bg-background border-r border-border">
      <div className="h-full flex flex-col p-4">
        {!isSettings ? (
          <>
            {/* Page Title & Close Button */}
            <SecondaryNavHeader title={pageTitle} />
            
            {/* Page-specific Content */}
            <PageContent pathname={pathname} />
            
            {/* Bottom Content (Schedule Card, etc.) */}
            <BottomContent />
          </>
        ) : (
          <>
            {/* Settings Navigation */}
            <SecondaryNavHeader title="Settings" />
            <SettingsNavigation />
          </>
        )}
      </div>
    </div>
  )
}