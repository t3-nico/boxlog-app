'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export function PageTitle() {
  const pathname = usePathname()
  
  // パス名から表示名を取得
  const getPageTitle = (path: string) => {
    if (path === '/calendar') return 'Calendar'
    if (path === '/table') return 'Table'
    if (path === '/board') return 'Board'
    if (path === '/stats') return 'Stats'
    if (path === '/search') return 'Search'
    if (path === '/add') return 'Add'
    if (path.startsWith('/settings')) return 'Settings'
    return 'Dashboard'
  }

  return (
    <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
      {getPageTitle(pathname)}
    </div>
  )
}