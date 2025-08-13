'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { views } from '@/config/views'

export function ViewSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const handleViewChange = (path: string) => {
    console.log('ViewSwitcher: Navigating to', path)
    router.push(path)
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {views.map((view) => {
        const isActive = pathname === view.path || pathname.startsWith(view.path)
        const Icon = view.icon
        
        return (
          <button
            key={view.id}
            onClick={() => handleViewChange(view.path)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        )
      })}
    </div>
  )
}