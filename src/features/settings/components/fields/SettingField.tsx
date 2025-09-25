'use client'

import React from 'react'

import { Label } from '@/components/shadcn-ui/label'
import { colors, typography, spacing } from '@/config/theme'

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
    <div className={spacing.stackGap.sm}>
      <Label className={`${typography.body.small} font-medium ${colors.text.primary}`}>
        {label}
        {required ? <span className={`${colors.semantic.error.text} ml-1`}>*</span> : null}
      </Label>
      {description != null && (
        <p className={`${typography.body.small} ${colors.text.muted}`}>
          {description}
        </p>
      )}
      <div>
        {children}
      </div>
    </div>
  )
}