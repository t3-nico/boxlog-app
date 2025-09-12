'use client'

import React, { useState, useEffect, useRef } from 'react'

import { Edit2, Trash2, Copy } from 'lucide-react'

import { colors, spacing, typography, rounded, elevation } from '@/config/theme'
import type { CalendarEvent } from '@/features/events/types/events'

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
  onViewDetails
}: EventContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // 画面外に出ないよう位置調整
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current
      const rect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let {x} = position
      let {y} = position

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
      label: '編集',
      action: () => onEdit?.(event),
      available: !!onEdit
    },
    {
      icon: Copy,
      label: '複製',
      action: () => onDuplicate?.(event),
      available: !!onDuplicate
    },
    {
      icon: Trash2,
      label: '削除',
      action: () => onDelete?.(event),
      available: !!onDelete,
      dangerous: true
    }
  ].filter(item => item.available)

  return (
    <div
      ref={menuRef}
      className={`
        fixed z-50 min-w-[180px] 
        ${colors.background.base} 
        ${rounded.md} 
        ${elevation.md}
        border ${colors.border.alpha}
        ${spacing.cardVariants.compact}
        ${typography.body.small}
      `}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
    >
      {/* メニューアイテム */}
      <div className="space-y-1">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          
          return (
            <button
              key={index}
              onClick={() => handleAction(item.action)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-left
                ${rounded.sm}
                transition-colors
                ${item.dangerous 
                  ? `hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400`
                  : `${colors.secondary.hover} ${colors.text.primary}`
                }
              `}
            >
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}