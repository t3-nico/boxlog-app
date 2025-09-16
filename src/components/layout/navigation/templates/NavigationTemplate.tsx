'use client'

import React from 'react'

import { typography } from '@/config/theme'
import { border } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

export interface NavigationSection {
  id: string
  title?: string
  items: React.ReactNode[]
  className?: string
}

export interface NavigationTemplateProps {
  sections: NavigationSection[]
  className?: string
  showHeader?: boolean
  headerContent?: React.ReactNode
  footerContent?: React.ReactNode
  spacing?: 'compact' | 'normal' | 'relaxed'
}

export const NavigationTemplate = ({
  sections,
  className,
  showHeader = false,
  headerContent,
  footerContent,
  spacing = 'normal',
}: NavigationTemplateProps) => {
  const spacingClasses = {
    compact: 'space-y-2 p-3',
    normal: 'space-y-4 p-4',
    relaxed: 'space-y-6 p-6',
  }

  const sectionSpacing = {
    compact: 'space-y-1',
    normal: 'space-y-2',
    relaxed: 'space-y-3',
  }

  return (
    <div
      className={cn(
        'relative z-50 w-64 sm:w-full md:w-56 lg:w-64',
        colors.background.base,
        'border-r',
        border.universal,
        className
      )}
    >
      <div className={cn('flex h-full flex-col', spacingClasses[spacing])}>
        {/* Header Section */}
        {showHeader && headerContent && <div className="flex-shrink-0">{headerContent}</div>}

        {/* Main Content Sections */}
        <div className="flex-1 overflow-y-auto">
          {sections.map((section, index) => (
            <div key={section.id} className={cn(section.className, index !== sections.length - 1 && 'mb-4')}>
              {/* Section Title */}
              {section.title && (
                <div className="mb-2">
                  <h3 className={cn(typography.body.base, 'text-muted-foreground font-medium')}>{section.title}</h3>
                </div>
              )}

              {/* Section Items */}
              <div className={cn(sectionSpacing[spacing])}>
                {section.items.map((item, itemIndex) => (
                  <div key={item.key || `item-${itemIndex}`}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        {footerContent && <div className="mt-auto flex-shrink-0">{footerContent}</div>}
      </div>
    </div>
  )
}
