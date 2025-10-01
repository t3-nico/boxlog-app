'use client'

import React from 'react'

import { Label } from '@/components/shadcn-ui/label'

interface SettingFieldProps {
  label: string
  description?: string
  children: React.ReactNode
  required?: boolean
}

export const SettingField = ({
  label,
  description,
  children,
  required
}: SettingFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {label}
        {required ? <span className="text-red-600 dark:text-red-400 ml-1">*</span> : null}
      </Label>
      {description != null && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
      <div>
        {children}
      </div>
    </div>
  )
}