'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/lib/navigation/config'
import { NavItem } from './nav-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'

export function PrimaryNavigation() {
  const pathname = usePathname()

  return (
    <div className={cn(
      'w-[60px] bg-background border-r border-border flex flex-col'
    )}>
      {/* Main Navigation Items */}
      <div className="flex-1 flex flex-col items-center py-4 gap-2">
        {primaryNavigation.map((section) => (
          <React.Fragment key={section.id}>
            {section.items.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ))}
            {/* Add separator between sections */}
            {section.id !== 'user' && (
              <div className="w-8 h-px bg-border my-2" />
            )}
          </React.Fragment>
        ))}
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Bottom Section: Settings & User */}
      <div className="flex flex-col items-center pb-4 gap-2">
        <UserMenu />
      </div>
    </div>
  )
}