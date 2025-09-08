'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { background, border } from '@/config/theme/colors'
import { layout, spacing } from '@/config/theme'

const { xs: headerHeight } = layout.heights.header
const mt2 = 'mt-2' // 8px top margin - theme準拠
const px4 = 'px-4' // 16px horizontal padding - theme準拠

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

export function Header({ className, children }: HeaderProps) {
  return (
    <div
      className={cn(
        headerHeight, // 32px height
        'w-full',
        'flex items-center justify-start',
        mt2, // 8px top margin
        px4, // 16px horizontal padding
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