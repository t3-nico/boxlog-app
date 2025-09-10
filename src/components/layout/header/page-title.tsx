'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { typography } from '@/config/theme'
import { text } from '@/config/theme/colors'

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return 'Dashboard'
  }
  
  switch (segments[0]) {
    case 'calendar':
      if (segments[1] === 'day') return 'Calendar - Day'
      if (segments[1] === 'week') return 'Calendar - Week'
      if (segments[1] === 'month') return 'Calendar - Month'
      if (segments[1] === '3day') return 'Calendar - 3 Day'
      if (segments[1] === '2week') return 'Calendar - 2 Week'
      return 'Calendar'
    
    case 'tasks':
      return 'Tasks'
    
    case 'projects':
      return 'Projects'
    
    case 'logs':
      return 'Logs'
    
    case 'analytics':
      return 'Analytics'
    
    case 'settings':
      return 'Settings'
    
    case 'profile':
      return 'Profile'
    
    default:
      return segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
  }
}

export function PageTitle() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  
  return (
    <h1 className={cn(
      typography.heading.h5, // コンパクトヘッダー用サイズ
      'md:text-base', // デスクトップでは通常サイズ
      'text-sm', // モバイルでは小さめサイズ
      text.primary,
      'font-semibold truncate text-center md:text-left'
    )}>
      {title}
    </h1>
  )
}