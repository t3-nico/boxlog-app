'use client'

import React from 'react'

import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

export const ThemeToggle = () => {
  return (
    <div className="relative group">
      <div className={cn(
        'w-10 h-10 flex items-center justify-center',
        'text-neutral-600 dark:text-neutral-400',
        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        'rounded-md',
        'transition-colors duration-150'
      )}>
        <SimpleThemeToggle />
      </div>
      <div className={cn(
        'absolute left-full ml-2 px-2 py-1',
        'bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-neutral-100',
        'text-xs shadow-lg',
        'opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50',
        'rounded',
        'transition-opacity duration-150'
      )}>
        Toggle Theme
      </div>
    </div>
  )
}