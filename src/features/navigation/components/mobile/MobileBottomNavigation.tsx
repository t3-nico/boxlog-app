'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { BarChart3, Calendar, Inbox, MoreHorizontal, Tag } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

import { MoreActionSheet } from './MoreActionSheet'

/**
 * モバイル用ボトムナビゲーション
 *
 * 5項目構成:
 * - Calendar: カレンダーページ
 * - Inbox: 受信箱ページ
 * - Tags: タグ管理ページ
 * - Stats: 統計ページ
 * - More: その他メニュー（ボトムシート展開）
 *
 * **デザイン仕様**:
 * - 高さ: 64px（h-16）
 * - アイコン: 24px（size-6）
 * - Material Design 3 Navigation Bar準拠
 * - 8pxグリッドシステム準拠
 * - セマンティックトークン使用
 */
export function MobileBottomNavigation() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const t = useTranslations()
  const locale = useLocale() as 'ja' | 'en'

  // ナビゲーション項目
  const navItems = [
    {
      id: 'calendar',
      label: t('sidebar.navigation.calendar'),
      href: `/${locale}/calendar`,
      icon: Calendar,
      isActive: pathname?.includes('/calendar') ?? false,
    },
    {
      id: 'inbox',
      label: t('sidebar.navigation.inbox'),
      href: `/${locale}/inbox`,
      icon: Inbox,
      isActive: pathname?.includes('/inbox') ?? false,
    },
    {
      id: 'tags',
      label: t('sidebar.navigation.tags'),
      href: `/${locale}/tags`,
      icon: Tag,
      isActive: pathname?.includes('/tags') ?? false,
    },
    {
      id: 'stats',
      label: t('sidebar.navigation.stats'),
      href: `/${locale}/stats`,
      icon: BarChart3,
      isActive: pathname?.includes('/stats') ?? false,
    },
  ]

  return (
    <>
      <nav
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50',
          'flex items-center',
          'h-16',
          'bg-surface-dim border-border border-t',
          // iOS Safe Area対応（ホームインジケーター領域を確保）
          'pb-safe'
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className="flex h-full min-w-12 flex-1 flex-col items-center justify-center gap-1 px-2 py-2"
              aria-current={item.isActive ? 'page' : undefined}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full px-3 py-1 transition-colors',
                  item.isActive && 'bg-primary-container'
                )}
              >
                <Icon
                  className={cn('size-6 transition-colors', item.isActive ? 'text-primary' : 'text-muted-foreground')}
                />
              </div>
              <span
                className={cn(
                  'text-xs leading-tight transition-colors',
                  item.isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className="flex h-full min-w-12 flex-1 flex-col items-center justify-center gap-1 px-2 py-2"
          aria-expanded={isMoreOpen}
          aria-haspopup="dialog"
        >
          <div className="flex items-center justify-center rounded-full px-3 py-1">
            <MoreHorizontal className="text-muted-foreground size-6" />
          </div>
          <span className="text-muted-foreground text-xs leading-tight">{t('navigation.more.label')}</span>
        </button>
      </nav>

      {/* More Action Sheet */}
      <MoreActionSheet open={isMoreOpen} onOpenChange={setIsMoreOpen} locale={locale} />
    </>
  )
}
