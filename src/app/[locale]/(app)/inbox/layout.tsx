'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, type ReactNode } from 'react'

import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { InboxSidebar } from '@/features/inbox/components/InboxSidebar'
import { useInboxData } from '@/features/inbox/hooks/useInboxData'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'
import { useMobileHeader } from '@/features/navigation/hooks/useMobileHeader'

interface InboxLayoutProps {
  children: ReactNode
}

/**
 * Inbox共通レイアウト
 *
 * Sidebar + メインコンテンツの2カラムレイアウト
 * URLパスからactiveViewIdを同期
 */
export default function InboxLayout({ children }: InboxLayoutProps) {
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] ?? 'ja') as 'ja' | 'en'
  const { t } = useI18n(locale)
  const { setActiveView } = useInboxViewStore()

  // モバイルヘッダー設定
  useMobileHeader({
    title: t('navigation.inbox'),
    actions: (
      <Button variant="ghost" size="icon" className="size-10" aria-label={t('common.search')}>
        <Search className="size-5" />
      </Button>
    ),
  })

  // 全Planデータを取得
  const { items } = useInboxData()

  // アクティブなPlan数とアーカイブ数を計算
  const { activePlansCount, archivedPlansCount } = useMemo(() => {
    // TODO: アーカイブフラグがある場合はそれで判定
    // 現状はアーカイブ機能がないため、全てアクティブとして扱う
    const active = items.length
    const archived = 0

    return {
      activePlansCount: active,
      archivedPlansCount: archived,
    }
  }, [items])

  // URLパスからviewIdへのマッピング
  useEffect(() => {
    if (!pathname) return

    const segments = pathname.split('/')
    const lastSegment = segments[segments.length - 1]

    // パスからviewId決定
    let viewId: string
    if (lastSegment === 'all') {
      viewId = 'default-all'
    } else if (lastSegment === 'archive') {
      viewId = 'default-archive'
    } else if (segments[segments.length - 2] === 'view') {
      viewId = lastSegment // カスタムビューID
    } else {
      viewId = 'default-all' // デフォルト
    }

    setActiveView(viewId)
  }, [pathname, setActiveView])

  return (
    <div className="flex h-full">
      {/* 左: Sidebar */}
      <div className="border-border w-64 shrink-0 border-r">
        <InboxSidebar activeplansCount={activePlansCount} archivedplansCount={archivedPlansCount} />
      </div>

      {/* 右: メインコンテンツ */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  )
}
