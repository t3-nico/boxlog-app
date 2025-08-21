'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { SimpleThemeToggle } from '@/components/shadcn-ui/theme-toggle'
import { componentRadius, animations } from '@/config/theme'

export function ThemeToggle() {
  return (
    <div className="relative group">
      <div className={cn(
        'w-10 h-10 flex items-center justify-center',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        componentRadius.button.md,
        animations.transition.fast
      )}>
        <SimpleThemeToggle />
      </div>
      <div className={cn(
        'absolute left-full ml-2 px-2 py-1',
        'bg-popover text-popover-foreground text-xs shadow-lg',
        'opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50',
        componentRadius.input.text,
        animations.transition.fast
      )}>
        Toggle Theme
      </div>
    </div>
  )
}