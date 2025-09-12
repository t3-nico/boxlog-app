'use client'

import React from 'react'

import { colors, layout, spacing } from '@/config/theme'
import { cn } from '@/lib/utils'

const { xs: headerHeight } = layout.heights.header

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

export const Header = ({ className, children }: HeaderProps) => {
  return (
    <div
      className={cn(
        headerHeight, // 32px height
        'w-full',
        layout.flexbox.start,
        spacing.padding.responsive.x,
        'md:mt-2',
        colors.background.base,
        colors.border.default,
        'shrink-0', // フレックス時に縮まないようにする
        className
      )}
    >
      {children}
    </div>
  )
}