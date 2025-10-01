'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

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

export const PageTitle = () => {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  
  return (
    <h1
      className={cn(
        'text-base font-semibold tracking-tight',
        'md:text-base text-sm',
        'text-neutral-900 dark:text-neutral-100',
        'truncate text-center md:text-left'
      )}
    >
      {title}
    </h1>
  )
}