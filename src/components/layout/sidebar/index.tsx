'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/config/navigation/config'
import { SidebarItem } from './sidebar-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { ResizeHandle } from './resize-handle'
import { useNavigationStore } from './stores/navigation.store'
import { background, text, border } from '@/config/theme/colors'
import { PanelLeftClose } from 'lucide-react'
import { componentRadius, animations, spacing } from '@/config/theme'

export function Sidebar() {
  const pathname = usePathname()
  const primaryNavWidth = useNavigationStore((state) => state.primaryNavWidth)
  const { toggleSidebar } = useNavigationStore()
  
  return (
    <div 
      className={cn(
        'flex relative z-50',
        background.base,
        text.primary
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Section: User Menu & Close Button */}
          <div className={cn(
            'flex items-center justify-between px-3 py-3'
          )}>
            {/* User Menu with Name */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <UserMenu />
              <div className={cn(
                'min-w-0 flex-1',
                text.primary,
                'font-medium text-sm'
              )}>
                <div className="truncate">
                  User Name
                </div>
              </div>
            </div>

            {/* Close Panel Button */}
            <button
              onClick={() => toggleSidebar()}
              className={cn(
                'w-8 h-8 flex items-center justify-center hover:bg-accent',
                componentRadius.button.sm,
                animations.transition.fast,
                'flex-shrink-0'
              )}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Main Navigation Items */}
          <div className={cn(
            'flex-1 flex flex-col px-3 py-3 space-y-1'
          )}>
            {primaryNavigation.filter(section => section.id !== 'user').map((section, sectionIndex, filteredSections) => (
              <React.Fragment key={section.id}>
                {section.items.map((item) => (
                  <SidebarItem
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

          {/* Bottom Section: Settings & Theme Toggle */}
          <div className={cn(
            'flex flex-col px-3 pb-4 space-y-1'
          )}>
            {primaryNavigation.find(section => section.id === 'user')?.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ))}
            <div className="flex items-center justify-start mt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Resize Handle */}
        <ResizeHandle />
      </div>
  )
}