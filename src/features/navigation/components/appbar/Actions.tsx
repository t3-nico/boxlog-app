'use client'

import { useTicketInspectorStore } from '@/features/inspector/stores/useTicketInspectorStore'
import { NotificationDropdown } from '@/features/notifications'
import { Moon, Plus, Search, Sun } from 'lucide-react'
import { useCallback } from 'react'
import { Item } from './Item'

interface ActionsProps {
  onSearch: () => void
  onToggleTheme: (theme: 'light' | 'dark') => void
  resolvedTheme: 'light' | 'dark' | undefined
  t: (key: string) => string
}

/**
 * AppBarアクションセクション
 *
 * Search、Theme、Notificationsのアクションボタンを表示
 * useCallbackを使用してjsx-no-bind警告を回避
 */
export function Actions({ onSearch, onToggleTheme, resolvedTheme, t }: ActionsProps) {
  const { open: openInspector } = useTicketInspectorStore()

  // useCallbackでイベントハンドラを定義（jsx-no-bind対策）
  const handleCreateClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      openInspector('create-ticket')
    },
    [openInspector]
  )

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
      <Item icon={Plus} label={t('actions.create')} url="#" isActive={false} onClick={handleCreateClick} />
      <Item icon={Search} label={t('actions.search')} url="#" isActive={false} onClick={handleSearchClick} />
      <Item
        icon={resolvedTheme === 'light' ? Moon : Sun}
        label={t('sidebar.theme')}
        url="#"
        isActive={false}
        onClick={handleThemeClick}
      />
      <div className="flex flex-col items-center gap-1">
        <NotificationDropdown />
        <span className="text-center text-[11px] leading-tight">{t('notifications.title')}</span>
      </div>
    </div>
  )
}
