'use client'

import React from 'react'

import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
  children?: React.ReactNode
}

export const Header = ({ className, children }: HeaderProps) => {
  return (
    <div
      className={cn(
        'h-8', // 32px height
        'w-full',
        'flex items-center justify-start',
        'px-4',
        'md:mt-2',
        'bg-neutral-100 dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-800',
        'shrink-0', // フレックス時に縮まないようにする
        className
      )}
    >
      {children}
    </div>
  )
}