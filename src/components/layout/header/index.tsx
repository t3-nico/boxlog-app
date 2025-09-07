'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { background, border } from '@/config/theme/colors'

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

export function Header({ className, children }: HeaderProps) {
  return (
    <div
      className={cn(
        'h-16', // 64px height
        'w-full',
        'flex items-center justify-between',
        'px-6 py-4', // horizontal: 24px, vertical: 16px
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