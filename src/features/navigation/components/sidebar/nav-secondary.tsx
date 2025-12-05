'use client'

import { type LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'
import { cn } from '@/lib/utils'
import type { TranslatedString } from '@/types/i18n-branded'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()
  const openSettings = useSettingsDialogStore((state) => state.openSettings)

  const handleItemClick = React.useCallback(
    (item: { title: TranslatedString; url: string }) => {
      return (e: React.MouseEvent) => {
        // Settingsの場合はDialogを開く
        if (item.title === t('sidebar.navigation.settings')) {
          e.preventDefault()
          openSettings()
        }
      }
    },
    [openSettings, t]
  )

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {items.map((item) => {
        const isActive = pathname === item.url || pathname?.startsWith(item.url + '/')
        return (
          <a
            key={item.title}
            href={item.title === t('sidebar.navigation.settings') ? '#' : item.url}
            onClick={handleItemClick(item)}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-state-active text-state-active-foreground' : 'hover:bg-state-hover'
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
