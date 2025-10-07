'use client'

import { useEffect, useRef } from 'react'

import Image from 'next/image'

import { X, Calendar, Settings, Download, Upload, User, Bell, Palette } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

export type DrawerMenuItem = {
  id: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  badge?: number
  disabled?: boolean
  divider?: boolean
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  items?: DrawerMenuItem[]
  userInfo?: {
    name: string
    email?: string
    avatar?: string
  }
  className?: string
}

/**
 * モバイル用ドロワーメニュー
 * 左側からスライドインするサイドメニュー
 */
export const MobileDrawer = ({
  isOpen,
  onClose,
  title,
  items,
  userInfo,
  className
}: MobileDrawerProps) => {
  const { t } = useI18n()
  const drawerRef = useRef<HTMLDivElement>(null)

  const defaultMenuItems: DrawerMenuItem[] = [
    {
      id: 'calendar',
      label: t('calendar.mobile.drawer.calendar'),
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'settings',
      label: t('calendar.mobile.drawer.settings'),
      icon: <Settings className="h-5 w-5" />
    },
    {
      id: 'notifications',
      label: t('calendar.mobile.drawer.notifications'),
      icon: <Bell className="h-5 w-5" />,
      badge: 3
    },
    {
      id: 'theme',
      label: t('settings.preferences.title'),
      icon: <Palette className="h-5 w-5" />
    },
    {
      id: 'divider1',
      label: '',
      icon: null,
      divider: true
    },
    {
      id: 'export',
      label: t('settings.dataExport.title'),
      icon: <Download className="h-5 w-5" />
    },
    {
      id: 'import',
      label: t('actions.create'),
      icon: <Upload className="h-5 w-5" />
    }
  ]

  const menuItems = items ?? defaultMenuItems
  const menuTitle = title ?? t('navigation.settings')

  // ESCキーでクローズ
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // スクロールを防止
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // フォーカストラップ
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus()
              e.preventDefault()
            }
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)
      firstElement?.focus()

      return () => document.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  const handleItemClick = (item: DrawerMenuItem) => {
    if (item.disabled || item.divider) return
    item.onClick?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ドロワー */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-0 left-0 h-full w-80 max-w-[85vw]',
          'bg-background border-r border-border shadow-xl z-50',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={menuTitle}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">{menuTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-accent/50 rounded-full transition-colors"
            aria-label={t('calendar.mobile.drawer.closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ユーザー情報 */}
        {userInfo != null && (
          <div className="p-4">
            <div className="flex items-center gap-3">
              {userInfo.avatar ? (
                <Image
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  sizes="40px"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{userInfo.name}</div>
                {userInfo.email != null && (
                  <div className="text-sm text-muted-foreground truncate">
                    {userInfo.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* メニューアイテム */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {menuItems.map((item) => {
              if (item.divider) {
                return (
                  <div
                    key={item.id}
                    className="my-2 border-t border-border"
                  />
                )
              }

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left',
                    'hover:bg-accent/50 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {/* アイコン */}
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>

                  {/* ラベル */}
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>

                  {/* バッジ */}
                  {item.badge && item.badge > 0 ? <div className="min-w-[20px] h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center px-1.5">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div> : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}