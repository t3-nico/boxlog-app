'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/components/layout/navigation/navigation/config'
import { AppBarItem } from './app-bar-item'
import { UserMenu } from './user-menu'

export function AppBar() {
  const pathname = usePathname()

  return (
    <div className={cn(
      'w-[60px] bg-background border-r border-border flex flex-col'
    )}>
      {/* Main Navigation Items */}
      <div className="flex-1 flex flex-col items-center py-3 gap-2">
        {primaryNavigation.filter(section => section.id !== 'user').map((section, sectionIndex, filteredSections) => (
          <React.Fragment key={section.id}>
            {section.items.map((item) => (
              <AppBarItem
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ))}
            {/* Add separator between sections, except before last section */}
            {sectionIndex < filteredSections.length - 1 && (
              <div className="w-8 h-px bg-border my-2" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Section: Settings & User */}
      <div className="flex flex-col items-center pb-4 gap-2">
        {primaryNavigation.find(section => section.id === 'user')?.items.map((item) => (
          <AppBarItem
            key={item.id}
            item={item}
            pathname={pathname}
          />
        ))}
        <UserMenu />
      </div>
    </div>
  )
}