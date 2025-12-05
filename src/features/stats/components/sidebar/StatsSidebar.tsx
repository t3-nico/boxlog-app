'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { BarChart3 } from 'lucide-react'

import { SidebarHeader } from '@/features/navigation/components/sidebar/SidebarHeader'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

/**
 * 統計ページ専用サイドバー
 *
 * シンプルなナビゲーション（概要のみ）
 * 将来的にページが増えたら拡張予定
 */
export function StatsSidebar() {
  const pathname = usePathname()
  const localeFromPath = (pathname?.split('/')[1] || 'ja') as 'ja' | 'en'
  const t = useTranslations()

  const baseUrl = `/${localeFromPath}/stats`

  // 現在のパスがアクティブかどうかを判定
  const isActive = (href: string) => {
    if (href === baseUrl) {
      return pathname === baseUrl
    }
    return pathname?.startsWith(href) ?? false
  }

  // ナビゲーション項目
  const navItems: NavItem[] = [
    {
      href: baseUrl,
      label: t('stats.sidebar.overview'),
      icon: <BarChart3 className="size-4" />,
    },
  ]

  return (
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* Header */}
      <SidebarHeader title={t('sidebar.navigation.stats')} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/8'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
