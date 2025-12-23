'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Calendar, Inbox, MoreHorizontal, Tag } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useLocale, useTranslations } from 'next-intl'

import { MoreActionSheet } from './MoreActionSheet'

/**
 * モバイル用ボトムナビゲーション
 *
 * 4項目構成:
 * - Calendar: カレンダーページ
 * - Inbox: 受信箱ページ
 * - Tags: タグ管理ページ
 * - More: その他メニュー（ボトムシート展開）
 *
 * **デザイン仕様**:
 * - 高さ: 64px（h-16）
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
  ]

  return (
    <>
      <nav
        className={cn(
          'fixed right-0 bottom-0 left-0 z-50',
          'flex items-center',
          'h-16',
          'bg-background border-border border-t'
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
              className="flex h-full flex-1 flex-col items-center justify-center gap-1 px-2 py-2"
              aria-current={item.isActive ? 'page' : undefined}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full p-2 transition-colors',
                  item.isActive && 'bg-primary-container'
                )}
              >
                <Icon
                  className={cn('size-5 transition-colors', item.isActive ? 'text-primary' : 'text-muted-foreground')}
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
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 px-2 py-2"
          aria-expanded={isMoreOpen}
          aria-haspopup="dialog"
        >
          <div className="flex items-center justify-center rounded-full p-2">
            <MoreHorizontal className="text-muted-foreground size-5" />
          </div>
          <span className="text-muted-foreground text-xs leading-tight">{t('navigation.more.label')}</span>
        </button>
      </nav>

      {/* More Action Sheet */}
      <MoreActionSheet open={isMoreOpen} onOpenChange={setIsMoreOpen} locale={locale} />
    </>
  )
}
