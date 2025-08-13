'use client'

import React from 'react'
import { SimpleThemeToggle } from '@/components/ui/theme-toggle'

export function ThemeToggle() {
  return (
    <div className="relative group">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-accent">
        <SimpleThemeToggle />
      </div>
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        Toggle Theme
      </div>
    </div>
  )
}