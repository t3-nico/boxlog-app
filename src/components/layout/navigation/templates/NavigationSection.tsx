'use client'

import React from 'react'

import { typography } from '@/config/theme'
import { text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

export interface NavigationSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
  contentClassName?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export const NavigationSection = ({
  title,
  children,
  className,
  titleClassName,
  contentClassName,
  collapsible = false,
  defaultCollapsed = false,
  icon: Icon
}: NavigationSectionProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Section Header */}
      {title && (
        <div
          className={cn(
            'flex items-center',
            collapsible && 'cursor-pointer hover:opacity-70 transition-opacity',
            titleClassName
          )}
          onClick={handleToggle}
          {...(collapsible && {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': !isCollapsed,
            'aria-label': `${isCollapsed ? 'Expand' : 'Collapse'} ${title} section`,
            onKeyDown: (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleToggle()
              }
            }
          })}
        >
          {Icon && (
            <Icon className={cn(
              'w-4 h-4 mr-2 flex-shrink-0',
              text.muted
            )} />
          )}
          
          <h3 className={cn(
            'flex-1',
            heading.h4,
            text.muted,
typography.body.xs, 'font-semibold uppercase tracking-wider'
          )}>
            {title}
          </h3>

          {collapsible && (
            <svg
              className={cn(
                'w-4 h-4 transition-transform',
                text.muted,
                isCollapsed ? 'rotate-0' : 'rotate-90'
              )}
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && (
        <div className={cn(
          'space-y-1',
          contentClassName
        )}>
          {children}
        </div>
      )}
    </div>
  )
}