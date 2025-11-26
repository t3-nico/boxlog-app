'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/i18n/lib/hooks'
import { useMobileHeader } from '@/features/navigation/hooks/useMobileHeader'

interface TagsLayoutProps {
  children: ReactNode
}

/**
 * Tags共通レイアウト
 *
 * モバイルヘッダー設定を提供
 * （TagsPageProviderはbase-layout-content.tsxで提供）
 */
export default function TagsLayout({ children }: TagsLayoutProps) {
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] ?? 'ja') as 'ja' | 'en'
  const { t } = useI18n(locale)

  // モバイルヘッダー設定
  useMobileHeader({
    title: t('navigation.tags'),
    actions: (
      <Button variant="ghost" size="icon" className="size-10" aria-label={t('common.search')}>
        <Search className="size-5" />
      </Button>
    ),
  })

  return <>{children}</>
}
