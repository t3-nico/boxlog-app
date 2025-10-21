'use client'

import { NotificationDropdown } from '@/features/notifications'
import { Moon, Search, Settings, Sun } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Item } from './Item'

interface ActionsProps {
  onSearch: () => void
  onToggleTheme: (theme: 'light' | 'dark') => void
  resolvedTheme: 'light' | 'dark' | undefined
  locale: 'ja' | 'en'
  t: (key: string) => string
}

/**
 * AppBarアクションセクション
 *
 * Search、Theme、Notifications、Settingsのアクションボタンを表示
 * useCallbackを使用してjsx-no-bind警告を回避
 */
export function Actions({ onSearch, onToggleTheme, resolvedTheme, locale, t }: ActionsProps) {
  const pathname = usePathname()

  // useCallbackでイベントハンドラを定義（jsx-no-bind対策）
  const handleSearchClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onSearch()
    },
    [onSearch]
  )

  const handleThemeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onToggleTheme(resolvedTheme === 'light' ? 'dark' : 'light')
    },
    [onToggleTheme, resolvedTheme]
  )

  return (
    <div className="bg-sidebar flex flex-col items-center gap-2 px-2">
      <Item
        icon={Search}
        label={t('siteHeader.search.placeholder')}
        url="#"
        isActive={false}
        onClick={handleSearchClick}
      />
      <Item
        icon={resolvedTheme === 'light' ? Moon : Sun}
        label={t('siteHeader.theme')}
        url="#"
        isActive={false}
        onClick={handleThemeClick}
      />
      <div className="flex flex-col items-center gap-1">
        <NotificationDropdown />
        <span className="text-center text-[11px] leading-tight">{t('siteHeader.notifications')}</span>
      </div>
      <Item
        icon={Settings}
        label={t('sidebar.navigation.settings')}
        url={`/${locale}/settings`}
        isActive={pathname?.startsWith(`/${locale}/settings`) ?? false}
      />
    </div>
  )
}
