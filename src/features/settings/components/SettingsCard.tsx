'use client'

import React from 'react'

import { Loader2 } from 'lucide-react'

import { colors, rounded, spacing, typography } from '@/config/theme'
import { cn } from '@/lib/utils'

interface SettingsCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  noPadding?: boolean
  isSaving?: boolean
}

export const SettingsCard = ({
  title,
  description,
  children,
  className,
  actions,
  noPadding = false,
  isSaving = false,
}: SettingsCardProps) => {
  return (
    <div
      className={cn(
        `${colors.background.surface} ${rounded.lg} border ${colors.border.alpha}`,
        'transition-all duration-200',
        isSaving && 'border-blue-300 dark:border-blue-700',
        className
      )}
    >
      {(title || description || actions || isSaving) && (
        <div className={`${spacing.cardVariants.default} border-b ${colors.border.alpha}`}>
          <div className="flex items-start justify-between">
            <div>
              {title && <h3 className={`${typography.body.DEFAULT} font-medium ${colors.text.primary}`}>{title}</h3>}
              {description && <p className={`mt-1 ${typography.body.small} ${colors.text.muted}`}>{description}</p>}
            </div>

            <div className="ml-4 flex flex-shrink-0 items-center gap-3">
              {/* 保存中インジケーター（控えめ） */}
              {isSaving && (
                <div className={`flex items-center gap-2 ${typography.body.small} ${colors.primary.text}`}>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>保存中...</span>
                </div>
              )}

              {actions && <div>{actions}</div>}
            </div>
          </div>
        </div>
      )}
      <div className={cn(noPadding ? '' : spacing.cardVariants.default, typography.body.small)}>{children}</div>
    </div>
  )
}
