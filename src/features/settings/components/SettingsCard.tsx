'use client'

import React from 'react'
import { colors, typography, spacing, rounded } from '@/config/theme'
import { cn } from '@/lib/utils'

interface SettingsCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  noPadding?: boolean
}

export function SettingsCard({
  title,
  description,
  children,
  className,
  actions,
  noPadding = false
}: SettingsCardProps) {
  return (
    <div className={cn(
      `${colors.background.surface} ${rounded.lg} border ${colors.border.DEFAULT}`,
      className
    )}>
      {(title || description || actions) && (
        <div className={`${spacing.cardVariants.default} border-b ${colors.border.DEFAULT}`}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className={`${typography.body.DEFAULT} font-medium ${colors.text.primary}`}>
                  {title}
                </h3>
              )}
              {description && (
                <p className={`mt-1 ${typography.body.small} ${colors.text.muted}`}>
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className={`ml-4 flex-shrink-0`}>
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cn(
        noPadding ? '' : spacing.cardVariants.default,
        typography.body.small
      )}>
        {children}
      </div>
    </div>
  )
}