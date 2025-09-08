'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { background, border } from '@/config/theme/colors'
import { layout, spacing } from '@/config/theme'

const { compact } = layout.heights.header
const space4 = spacing.space[4] // p-4: 16px all around

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

export function Header({ className, children }: HeaderProps) {
  return (
    <div
      className={cn(
        compact, // 40px height
        'w-full',
        'flex items-center justify-start',
        space4, // 16px all around
        background.base, // ベース背景
        border.universal,
        'border-b',
        'shrink-0', // フレックス時に縮まないようにする
        className
      )}
    >
      {children}
    </div>
  )
}