'use client'

import { type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { SimpleThemeToggle } from '@/components/ui/theme-toggle'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useGlobalSearch } from '@/features/search'
import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'
import type { TranslatedString } from '@/types/i18n-branded'

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: {
    title: TranslatedString
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<'div'>) {
  const pathname = usePathname()
  const localeFromPath = (pathname.split('/')[1] || 'ja') as 'ja' | 'en'
  const { t } = useI18n(localeFromPath)
  const { openSettings } = useSettingsDialogStore()
  const { open: openGlobalSearch } = useGlobalSearch()

  const handleItemClick = React.useCallback(
    (item: { title: TranslatedString; url: string }) => {
      return (e: React.MouseEvent) => {
        // Settingsの場合はDialogを開く
        if (item.title === t('sidebar.navigation.settings')) {
          e.preventDefault()
          openSettings()
        }
        // Searchの場合はグローバル検索を開く
        if (item.title === t('sidebar.navigation.search')) {
          e.preventDefault()
          openGlobalSearch()
        }
      }
    },
    [openSettings, openGlobalSearch, t]
  )

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <div className="flex items-center justify-between rounded-md px-2 py-2">
        <span className="text-sm font-medium">{t('sidebar.theme')}</span>
        <SimpleThemeToggle />
      </div>
      {items.map((item) => {
        const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
        return (
          <a
            key={item.title}
            href={
              item.title === t('sidebar.navigation.settings') || item.title === t('sidebar.navigation.search')
                ? '#'
                : item.url
            }
            onClick={handleItemClick(item)}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </a>
        )
      })}
    </div>
  )
}
