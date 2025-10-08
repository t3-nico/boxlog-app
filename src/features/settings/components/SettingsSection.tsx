'use client'

import React from 'react'

import { cn } from '@/lib/utils'

interface SettingsSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const SettingsSection = ({ title, description, children, className }: SettingsSectionProps) => {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {title || description ? (
        <div>
          {title != null && (
            <h2 className={cn('text-lg font-semibold text-neutral-900 dark:text-neutral-100')}>{title}</h2>
          )}
          {description != null && (
            <p className={cn('mt-1 text-sm text-neutral-600 dark:text-neutral-400')}>{description}</p>
          )}
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  )
}
