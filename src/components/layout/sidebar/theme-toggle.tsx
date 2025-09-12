'use client'

import React from 'react'

import { SimpleThemeToggle } from '@/components/shadcn-ui/theme-toggle'
import { rounded, animations, colors } from '@/config/theme'
import { cn } from '@/lib/utils'

export const ThemeToggle = () => {
  return (
    <div className="relative group">
      <div className={cn(
        'w-10 h-10 flex items-center justify-center',
        colors.text.muted,
        colors.hover.subtle,
        rounded.component.button.md,
        animations.transition.fast
      )}>
        <SimpleThemeToggle />
      </div>
      <div className={cn(
        'absolute left-full ml-2 px-2 py-1',
        colors.background.popover,
        colors.text.popover,
        'text-xs shadow-lg',
        'opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50',
        rounded.component.input.text,
        animations.transition.fast
      )}>
        Toggle Theme
      </div>
    </div>
  )
}