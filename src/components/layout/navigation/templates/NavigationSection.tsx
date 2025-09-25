'use client'

import React, { useCallback } from 'react'

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
  icon: Icon,
}: NavigationSectionProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  // jsx-no-bind optimization: Toggle handler
  const handleToggle = useCallback(() => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }, [collapsible, isCollapsed])

  // jsx-no-bind optimization: Key down handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleToggle()
      }
    },
    [handleToggle]
  )

  return (
    <div className={cn('space-y-2', className)}>
      {/* Section Header */}
      {title != null && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className={cn(
            'flex items-center',
            collapsible && 'cursor-pointer transition-opacity hover:opacity-70',
            titleClassName
          )}
          onClick={handleToggle}
          {...(collapsible && {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': !isCollapsed,
            'aria-label': `${isCollapsed ? 'Expand' : 'Collapse'} ${title} section`,
            onKeyDown: handleKeyDown,
          })}
        >
          {Icon ? <Icon className={cn('mr-2 h-4 w-4 flex-shrink-0', text.muted)} /> : null}

          <h3 className={cn('flex-1', text.muted, typography.body.xs, 'font-semibold uppercase tracking-wider')}>
            {title}
          </h3>

          {collapsible != null && (
            <svg
              className={cn('h-4 w-4 transition-transform', text.muted, isCollapsed ? 'rotate-0' : 'rotate-90')}
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
      {(!collapsible || !isCollapsed) && <div className={cn('space-y-1', contentClassName)}>{children}</div>}
    </div>
  )
}
