'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/config/navigation/config'
import { AppBarItem } from './app-bar-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { background, text, border } from '@/config/theme/colors'

export function AppBar() {
  const pathname = usePathname()
  
  return (
    <div className={cn(
      'w-16 flex flex-col',
      background.base,
      text.primary
    )}>
      {/* Main Navigation Items */}
      <div className={cn(
        'flex-1 flex flex-col items-center py-3'
      )}>
        {primaryNavigation.filter(section => section.id !== 'user').map((section, sectionIndex, filteredSections) => (
          <React.Fragment key={section.id}>
            {section.items.map((item, itemIndex) => (
              <div key={item.id} className={itemIndex > 0 ? 'mt-2' : ''}>
                <AppBarItem
                  item={item}
                  pathname={pathname}
                />
              </div>
            ))}
            {/* Add separator between sections, except before last section */}
            {sectionIndex < filteredSections.length - 1 && (
              <div className={cn(
                'w-6 h-px mt-6 mb-6 bg-neutral-300 dark:bg-neutral-700'
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom Section: Settings & User */}
      <div className={cn(
        'flex flex-col items-center pb-4'
      )}>
        {primaryNavigation.find(section => section.id === 'user')?.items.map((item, itemIndex) => (
          <div key={item.id} className={itemIndex > 0 ? 'mt-2' : ''}>
            <AppBarItem
              item={item}
              pathname={pathname}
            />
          </div>
        ))}
        <div className="mt-2">
          <ThemeToggle />
        </div>
        <div className="mt-2">
          <UserMenu />
        </div>
      </div>
    </div>
  )
}