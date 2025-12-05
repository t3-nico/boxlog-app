'use client'

import React from 'react'

import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SettingsCardProps {
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  noPadding?: boolean
  isSaving?: boolean
}

export const SettingsCard = ({
  title,
  children,
  className,
  actions,
  noPadding = false,
  isSaving = false,
}: SettingsCardProps) => {
  return (
    <div
      className={cn(
        'border-border bg-surface-container text-foreground rounded-xl border',
        'transition-all duration-200',
        isSaving && 'border-primary/30',
        className
      )}
    >
      <div className={cn(noPadding ? '' : 'p-4')}>
        {(title || actions || isSaving) && (
          <div className="mb-4 flex items-center justify-between">
            {title ? <h3 className="text-foreground text-base font-medium">{title}</h3> : <div />}
            <div className="flex flex-shrink-0 items-center gap-3">
              {isSaving === true && (
                <div className="text-primary flex items-center gap-2 text-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>保存中...</span>
                </div>
              )}
              {actions ? <div>{actions}</div> : null}
            </div>
          </div>
        )}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
