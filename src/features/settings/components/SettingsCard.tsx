'use client'

import React from 'react'

import { Loader2 } from 'lucide-react'

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
        "bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800",
        "transition-all duration-200",
        isSaving && "border-blue-300 dark:border-blue-700",
        className
      )}
    >
      {(title || description || actions || isSaving) ? (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start justify-between">
            <div>
              {title ? <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">{title}</h3> : null}
              {description ? <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p> : null}
            </div>

            <div className="ml-4 flex flex-shrink-0 items-center gap-3">
              {/* 保存中インジケーター（控えめ） */}
              {isSaving === true && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
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
