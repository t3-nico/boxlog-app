'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/components/layout/navigation/navigation/config'
import { useNavigationStore } from '@/stores/navigation.store'
import { PageContent } from './page-content'
import { BottomContent } from './bottom-content'
import { SettingsNavigation } from './settings-navigation'
import { PanelLeft } from 'lucide-react'

export { SecondaryNavToggle } from './toggle'

function SecondaryNavHeader({ title }: { title: string }) {
  const { setSecondaryNavCollapsed } = useNavigationStore()

  return (
    <div className="flex-shrink-0 mb-4">
      <div className="px-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          {title}
        </h1>
        
        <button
          onClick={() => setSecondaryNavCollapsed(true)}
          className="p-1 rounded-md hover:bg-accent/50 transition-colors"
          title="Close sidebar"
        >
          <PanelLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

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