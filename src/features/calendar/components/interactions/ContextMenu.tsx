'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Copy, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  MapPin,
  Tag,
  Users,
  ExternalLink
} from 'lucide-react'
import { CalendarEvent } from '@/features/events'
import { cn } from '@/lib/utils'

// メニューアイテムの型定義
interface MenuItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  action: () => void
  disabled?: boolean
  destructive?: boolean
  divider?: boolean
}

// コンテキストメニューの位置
interface MenuPosition {
  x: number
  y: number
}

// コンテキストメニューのプロパティ
interface ContextMenuProps {
  isOpen: boolean
  position: MenuPosition
  onClose: () => void
  event?: CalendarEvent
  timeSlot?: { date: Date; time: string }
  onEditEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
  onDuplicateEvent?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time: string) => void
  onViewDetails?: (event: CalendarEvent) => void
}

export function ContextMenu({
  isOpen,
  position,
  onClose,
  event,
  timeSlot,
  onEditEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onCreateEvent,
  onViewDetails
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // 画面端での位置調整
  useEffect(() => {
    if (!isOpen || !menuRef.current) return

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let x = position.x
    let y = position.y

    // 右端チェック
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 8
    }

    // 下端チェック
    if (y + rect.height > viewport.height) {
      y = viewport.height - rect.height - 8
    }

    // 左端チェック
    if (x < 8) {
      x = 8
    }

    // 上端チェック
    if (y < 8) {
      y = 8
    }

    setAdjustedPosition({ x, y })
  }, [position, isOpen])

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // イベント用のメニューアイテム
  const getEventMenuItems = useCallback((event: CalendarEvent): MenuItem[] => {
    return [
      {
        id: 'view',
        label: 'イベントの詳細',
        icon: ExternalLink,
        action: () => {
          onViewDetails?.(event)
          onClose()
        }
      },
      {
        id: 'edit',
        label: '編集',
        icon: Edit,
        shortcut: 'E',
        action: () => {
          onEditEvent?.(event)
          onClose()
        }
      },
      {
        id: 'duplicate',
        label: '複製',
        icon: Copy,
        shortcut: 'Ctrl+D',
        action: () => {
          onDuplicateEvent?.(event)
          onClose()
        }
      },
      {
        id: 'divider1',
        label: '',
        action: () => {},
        divider: true
      },
      {
        id: 'delete',
        label: '削除',
        icon: Trash2,
        shortcut: 'Del',
        destructive: true,
        action: () => {
          onDeleteEvent?.(event.id)
          onClose()
        }
      }
    ]
  }, [onViewDetails, onEditEvent, onDuplicateEvent, onDeleteEvent, onClose])

  // 時間スロット用のメニューアイテム
  const getTimeSlotMenuItems = useCallback((timeSlot: { date: Date; time: string }): MenuItem[] => {
    return [
      {
        id: 'create',
        label: '新しいイベント',
        icon: Calendar,
        shortcut: 'N',
        action: () => {
          onCreateEvent?.(timeSlot.date, timeSlot.time)
          onClose()
        }
      },
      {
        id: 'create-meeting',
        label: 'ミーティング',
        icon: Users,
        action: () => {
          // ミーティング専用作成
          onCreateEvent?.(timeSlot.date, timeSlot.time)
          onClose()
        }
      },
      {
        id: 'create-reminder',
        label: 'リマインダー',
        icon: Clock,
        action: () => {
          // リマインダー専用作成
          onCreateEvent?.(timeSlot.date, timeSlot.time)
          onClose()
        }
      }
    ]
  }, [onCreateEvent, onClose])

  const menuItems = event 
    ? getEventMenuItems(event)
    : timeSlot 
    ? getTimeSlotMenuItems(timeSlot)
    : []

  if (!isOpen || menuItems.length === 0) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y
        }}
      >
        {menuItems.map((item) => {
          if (item.divider) {
            return (
              <div
                key={item.id}
                className="h-px bg-gray-200 dark:bg-gray-700 my-1"
              />
            )
          }

          return (
            <button
              key={item.id}
              onClick={item.action}
              disabled={item.disabled}
              className={cn(
                'w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                item.destructive && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              )}
            >
              {item.icon && (
                <item.icon className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {item.shortcut}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// コンテキストメニューを管理するカスタムフック
export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 })
  const [context, setContext] = useState<{
    event?: CalendarEvent
    timeSlot?: { date: Date; time: string }
  }>({})

  const openMenu = useCallback((
    e: React.MouseEvent,
    contextData: {
      event?: CalendarEvent
      timeSlot?: { date: Date; time: string }
    }
  ) => {
    e.preventDefault()
    e.stopPropagation()
    
    setPosition({ x: e.clientX, y: e.clientY })
    setContext(contextData)
    setIsOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    setContext({})
  }, [])

  return {
    isOpen,
    position,
    context,
    openMenu,
    closeMenu
  }
}

// 右クリック処理を簡素化するラッパーコンポーネント
interface RightClickWrapperProps {
  children: React.ReactNode
  onContextMenu: (e: React.MouseEvent) => void
  className?: string
}

export function RightClickWrapper({ children, onContextMenu, className }: RightClickWrapperProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // デフォルトの右クリックメニューを無効化
    e.preventDefault()
    onContextMenu(e)
  }, [onContextMenu])

  return (
    <div
      className={className}
      onContextMenu={handleContextMenu}
      style={{ userSelect: 'none' }} // テキスト選択を無効化
    >
      {children}
    </div>
  )
}

// キーボードショートカット表示用のヘルパー
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  
  return shortcut
    .replace(/Ctrl/g, isMac ? '⌘' : 'Ctrl')
    .replace(/Alt/g, isMac ? '⌥' : 'Alt')
    .replace(/Shift/g, isMac ? '⇧' : 'Shift')
}

// イベント固有のアクション
export const eventContextActions = {
  // 色変更
  changeColor: (event: CalendarEvent, color: string) => {
    console.log('Change color:', event.id, color)
  },
  
  // カテゴリ変更
  changeCategory: (event: CalendarEvent, category: string) => {
    console.log('Change category:', event.id, category)
  },
  
  // 時間変更
  reschedule: (event: CalendarEvent) => {
    console.log('Reschedule:', event.id)
  },
  
  // 招待者追加
  addAttendees: (event: CalendarEvent) => {
    console.log('Add attendees:', event.id)
  }
}