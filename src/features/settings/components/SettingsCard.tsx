'use client'

import React from 'react'

import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SettingsCardProps {
  title?: React.ReactNode
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
        'border-border bg-card text-card-foreground rounded-xl border',
        'transition-all duration-200',
        isSaving && 'border-primary/30',
        className
      )}
    >
      {title || description || actions || isSaving ? (
        <div className="border-border border-b p-4">
          <div className="flex items-start justify-between">
            <div>
              {title ? <h3 className="text-foreground text-base font-medium">{title}</h3> : null}
              {description ? (
                <p className="text-muted-foreground mt-1 text-sm">{description}</p>
              ) : null}
            </div>

            <div className="ml-4 flex flex-shrink-0 items-center gap-3">
              {/* 保存中インジケーター（控えめ） */}
              {isSaving === true && (
                <div className="text-primary flex items-center gap-2 text-sm">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>保存中...</span>
                </div>
              )}

              {actions ? <div>{actions}</div> : null}
            </div>
          </div>
        </div>
      ) : null}
      <div className={cn(noPadding ? '' : 'p-4', 'text-sm')}>{children}</div>
    </div>
  )
}
