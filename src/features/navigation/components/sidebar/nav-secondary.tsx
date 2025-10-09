'use client'

import { type LucideIcon } from 'lucide-react'
import * as React from 'react'

import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { useGlobalSearch } from '@/features/search'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<'div'>) {
  const { openSettings } = useSettingsDialogStore()
  const { open: openGlobalSearch } = useGlobalSearch()

  const handleItemClick = React.useCallback(
    (item: { title: string; url: string }) => {
      return (e: React.MouseEvent) => {
        // Settingsの場合はDialogを開く
        if (item.title === 'Settings') {
          e.preventDefault()
          openSettings()
        }
        // Searchの場合はグローバル検索を開く
        if (item.title === 'Search') {
          e.preventDefault()
          openGlobalSearch()
        }
      }
    },
    [openSettings, openGlobalSearch]
  )

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <div className="flex items-center justify-between rounded-md px-2 py-2">
        <span className="text-sm font-medium">Theme</span>
        <SimpleThemeToggle />
      </div>
      {items.map((item) => (
        <a
          key={item.title}
          href={item.title === 'Settings' || item.title === 'Search' ? '#' : item.url}
          onClick={handleItemClick(item)}
          className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </a>
      ))}
    </div>
  )
}
