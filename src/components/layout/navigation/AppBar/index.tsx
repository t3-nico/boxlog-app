'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/config/navigation/config'
import { AppBarItem } from './app-bar-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { ResizeHandle } from './resize-handle'
import { useNavigationStore } from '../stores/navigation.store'
import { background, text, border } from '@/config/theme/colors'

export function AppBar() {
  const pathname = usePathname()
  const primaryNavWidth = useNavigationStore((state) => state.primaryNavWidth)
  
  
  return (
    <div 
      className={cn(
        'flex relative z-50',
        background.base,
        text.primary
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
        {/* AppBar Content */}
        <div className="flex-1 flex flex-col">
          {/* Main Navigation Items */}
          <div className={cn(
            'flex-1 flex flex-col px-3 py-3 space-y-1'
          )}>
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
                  <div className={cn(
                    'h-px mx-3 my-2 bg-border'
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom Section: Settings & User */}
          <div className={cn(
            'flex flex-col px-3 pb-4 space-y-1'
          )}>
            {primaryNavigation.find(section => section.id === 'user')?.items.map((item) => (
              <AppBarItem
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ))}
            <div className="flex items-center justify-between mt-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
        
        {/* Resize Handle */}
        <ResizeHandle />
      </div>
  )
}