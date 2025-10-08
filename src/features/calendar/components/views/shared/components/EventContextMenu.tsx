'use client'

import { useEffect, useRef, useState } from 'react'

import { Copy, Edit2, Trash2 } from 'lucide-react'

import type { CalendarEvent } from '@/features/events/types/events'
import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

interface EventContextMenuProps {
  event: CalendarEvent
  position: { x: number; y: number }
  onClose: () => void
  onEdit?: (event: CalendarEvent) => void
  onDelete?: (event: CalendarEvent) => void
  onDuplicate?: (event: CalendarEvent) => void
  onViewDetails?: (event: CalendarEvent) => void
}

export const EventContextMenu = ({
  event,
  position,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: EventContextMenuProps) => {
  const { t } = useI18n()
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // 画面外に出ないよう位置調整
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current
      const rect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let { x } = position
      let { y } = position

      // 右端を超える場合は左に表示
      if (x + rect.width > viewportWidth - 10) {
        x = Math.max(10, viewportWidth - rect.width - 10)
      }

      // 下端を超える場合は上に表示
      if (y + rect.height > viewportHeight - 10) {
        y = Math.max(10, viewportHeight - rect.height - 10)
      }

      setAdjustedPosition({ x, y })
    }
  }, [position])

  // 外部クリック時にメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  const menuItems = [
    {
      icon: Edit2,
      label: t('calendar.contextMenu.edit'),
      action: () => onEdit?.(event),
      available: !!onEdit,
    },
    {
      icon: Copy,
      label: t('calendar.contextMenu.duplicate'),
      action: () => onDuplicate?.(event),
      available: !!onDuplicate,
    },
    {
      icon: Trash2,
      label: t('calendar.contextMenu.delete'),
      action: () => onDelete?.(event),
      available: !!onDelete,
      dangerous: true,
    },
  ].filter((item) => item.available)

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-md border border-neutral-200 bg-white p-2 text-sm shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* メニューアイテム */}
      <div className="space-y-1">
        {menuItems.map((item, _index) => {
          const IconComponent = item.icon

          return (
            <button
              type="button"
              key={item.label}
              onClick={() => handleAction(item.action)}
              className={cn(
                'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors',
                item.dangerous
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
