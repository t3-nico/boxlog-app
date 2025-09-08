'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { primaryNavigation } from '@/config/navigation/config'
import { SidebarItem } from './sidebar-item'
import { UserMenu } from './user-menu'
import { ThemeToggle } from './theme-toggle'
import { useNavigationStore } from './stores/navigation.store'
import { background, text, border, selection, semantic } from '@/config/theme/colors'
import { PanelLeftClose } from 'lucide-react'
import { componentRadius, animations, spacing, layout, icon, typography } from '@/config/theme'

const { xs } = layout.heights.header
const { sm } = icon.size
const gap1wo = 'gap-1' // 4px - theme準拠の最小gap
const space2 = spacing.space[2] // p-2: 8px all around
const px2 = 'px-2' // 8px horizontal padding - theme準拠
const py2 = 'py-2' // 8px vertical padding - theme準拠
const mx2 = 'mx-2' // 8px horizontal margin - theme準拠
const my2 = 'my-2' // 8px vertical margin - theme準拠

export function Sidebar() {
  const pathname = usePathname()
  const primaryNavWidth = useNavigationStore((state) => state.primaryNavWidth)
  const { toggleSidebar } = useNavigationStore()
  const setPrimaryNavWidth = useNavigationStore((state) => state.setPrimaryNavWidth)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    const startWidth = useNavigationStore.getState().primaryNavWidth

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX)
      
      // 幅制限を直接ここで実装
      const constrainedWidth = Math.max(200, Math.min(480, newWidth))
      setPrimaryNavWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div 
      className={cn(
        'flex relative z-[9999] border-r',
        background.surface,
        text.primary,
        border.universal
      )}
      style={{ width: `${primaryNavWidth}px` }}
    >
        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Section: Close Button */}
          <div className={cn(
            'flex items-center justify-end mt-2',
            xs, // 32px height
            px2 // 8px horizontal padding
          )}>
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
              <PanelLeftClose className={sm} />
            </button>
          </div>

          {/* Main Navigation Items */}
          <div className={cn(
            'flex flex-col space-y-1',
            px2, // 8px horizontal padding
            py2 // 8px vertical padding - theme準拠
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
                    'h-px bg-border',
                    mx2, // 8px horizontal margin - theme準拠
                    my2 // 8px vertical margin - theme準拠
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Settings & Theme Toggle */}
          <div className={cn(
            'flex flex-col space-y-1',
            px2 // 8px horizontal padding
          )}>
            {primaryNavigation.find(section => section.id === 'user')?.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                pathname={pathname}
              />
            ))}
            <div className={cn(
              'flex items-center justify-start mt-2',
              px2 // 8px horizontal padding
            )}>
              <ThemeToggle />
            </div>
          </div>

          {/* Bottom Section: User Account - 一番下 */}
          <div className={cn(
            'flex flex-col pb-4 mt-auto',
            px2 // 8px horizontal padding
          )}>
            <div className={cn(
              "flex items-center justify-start",
              gap1wo,
              xs // 32px height
            )}>
              <UserMenu />
              <div className={cn(
                'min-w-0 flex-1',
                text.primary,
                typography.heading.h5
              )}>
                <div className="truncate">
                  User Name
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Border Hover & Resize Area */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            'absolute -right-1 top-0 w-3 h-full cursor-ew-resize group'
          )}
        >
          {/* Visual Color Change - 1px width */}
          <div className={cn(
            'absolute right-1 top-0 w-px h-full transition-colors',
            'group-hover:bg-blue-600 dark:group-hover:bg-blue-500'
          )} />
        </div>
      </div>
  )
}