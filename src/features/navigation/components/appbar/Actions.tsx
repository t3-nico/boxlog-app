'use client'

import { NotificationDropdown } from '@/features/notifications'
import { PlanCreatePopover } from '@/features/plans/components'
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
    <>
      <div className="flex flex-col items-center gap-1 px-2" onClick={(e) => e.stopPropagation()}>
        <PlanCreatePopover
          triggerElement={
            <button className="flex flex-col items-center" type="button">
              <div className="hover:bg-state-hover focus-visible:ring-ring flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none">
                <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
              </div>
              <span className="text-center text-xs leading-tight">{t('actions.create')}</span>
            </button>
          }
        />
        <div className="flex flex-col items-center">
          <NotificationDropdown />
          <span className="text-center text-xs leading-tight">{t('notification.title')}</span>
        </div>
        <Item icon={Search} label={t('actions.search')} url="#" isActive={false} onClick={handleSearchClick} />
        <Item
          icon={resolvedTheme === 'light' ? Moon : Sun}
          label={t('sidebar.theme')}
          url="#"
          isActive={false}
          onClick={handleThemeClick}
        />
      </div>
    </>
  )
}
