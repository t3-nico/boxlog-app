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
          {title != null && <h2 className={cn('text-foreground text-lg font-semibold')}>{title}</h2>}
          {description != null && <p className={cn('text-muted-foreground mt-1 text-sm')}>{description}</p>}
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  )
}
