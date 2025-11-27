'use client'

import { Bell } from 'lucide-react'

import { useUnreadCount } from '../hooks/useNotificationsData'
import { useNotificationDialogStore } from '../stores/useNotificationDialogStore'

/**
 * 通知ドロップダウンコンポーネント（簡易版）
 *
 * - ベルアイコンをクリックするとNotificationDialogを開く
 * - 未読バッジ表示（実データ）
 */
interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { data: unreadCount = 0 } = useUnreadCount()
  const { open } = useNotificationDialogStore()

  return (
    <button
      type="button"
      onClick={open}
      className="hover:bg-foreground/8 data-[state=open]:bg-foreground/12 relative flex h-10 w-10 items-center justify-center rounded-lg outline-hidden"
      aria-label="通知"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="bg-destructive text-destructive-foreground absolute top-0.5 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}
