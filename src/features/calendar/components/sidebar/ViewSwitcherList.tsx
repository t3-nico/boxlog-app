'use client'

import { useEffect } from 'react'

import { CalendarDays, CalendarRange, Check, Columns3, LayoutGrid, List, type LucideIcon } from 'lucide-react'

import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'
import { useSidebarStore } from '@/features/navigation/stores/useSidebarStore'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface ViewOption {
  value: CalendarViewType
  labelKey: string
  shortcut: string
  icon: LucideIcon
}

const VIEW_OPTIONS: ViewOption[] = [
  { value: 'day', labelKey: 'calendar.views.day', shortcut: 'D', icon: CalendarDays },
  { value: '3day', labelKey: 'calendar.views.3day', shortcut: '3', icon: Columns3 },
  { value: '5day', labelKey: 'calendar.views.5day', shortcut: '5', icon: LayoutGrid },
  { value: 'week', labelKey: 'calendar.views.week', shortcut: 'W', icon: CalendarRange },
  { value: 'agenda', labelKey: 'calendar.views.agenda', shortcut: 'A', icon: List },
]

/**
 * サイドバー用ビュー切り替えリスト（モバイル専用）
 *
 * PCではヘッダーにViewSwitcherがあるため非表示
 */
export function ViewSwitcherList() {
  const navigation = useCalendarNavigation()
  const t = useTranslations()
  const closeSidebar = useSidebarStore((state) => state.close)
  const currentView = navigation?.viewType ?? 'day'

  // ショートカットキー機能
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl、Alt、Metaキーが押されている場合は無視
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // 入力フィールドにフォーカスがある場合は無視
      const { activeElement } = document
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      const key = event.key.toUpperCase()
      const option = VIEW_OPTIONS.find((opt) => opt.shortcut === key)

      if (option && option.value !== currentView && navigation) {
        event.preventDefault()
        navigation.changeView(option.value)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentView, navigation])

  const handleSelect = (view: CalendarViewType) => {
    if (navigation) {
      navigation.changeView(view)
      // モバイルでサイドバーを閉じる（このコンポーネント自体がmd:hiddenなのでモバイルのみ実行される）
      closeSidebar()
    }
  }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-2 md:hidden">
      {VIEW_OPTIONS.map((option) => {
        const isActive = currentView === option.value

        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4" />
              <span>{t(option.labelKey)}</span>
            </div>
            <div className="flex items-center gap-2">
              {isActive && <Check className="size-4" />}
              <span className="bg-surface-container text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                {option.shortcut}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
