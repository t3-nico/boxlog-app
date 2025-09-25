'use client'

import React from 'react'

import { colors, typography, spacing } from '@/config/theme'
import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const SettingsSection = ({
  title,
  description,
  children,
  className
}: SettingsSectionProps) => {
  return (
    <div className={cn(spacing.stackGap.lg, className)}>
      {(title || description) ? <div>
          {title != null && (
            <h2 className={`${typography.heading.h4} ${colors.text.primary}`}>
              {title}
            </h2>
          )}
          {description != null && (
            <p className={`mt-1 ${typography.body.small} ${colors.text.muted}`}>
              {description}
            </p>
          )}
        </div> : null}
      <div>
        {children}
      </div>
    </div>
  )
}