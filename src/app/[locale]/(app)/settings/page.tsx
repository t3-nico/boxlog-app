'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useLocale } from 'next-intl'

import { BREAKPOINT_VALUES } from '@/config/ui/breakpoints'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * 設定ページ（インデックス）
 *
 * PC: /settings/general にリダイレクト（サイドバーがあるため）
 * モバイル: 空のコンテンツ（layout.tsxのカテゴリ一覧が表示される）
 */
export default function SettingsPage() {
  const router = useRouter()
  const locale = useLocale()
  // md breakpoint (768px) 以上でリダイレクト
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINT_VALUES.md}px)`)

  useEffect(() => {
    // PCの場合のみリダイレクト
    if (isDesktop) {
      router.replace(`/${locale}/settings/general`)
    }
  }, [isDesktop, locale, router])

  // モバイルでは空のコンテンツ（layout.tsxのasideが表示される）
  // PCではリダイレクト中の一瞬だけ表示されるが、すぐにgeneralページに遷移
  return null
}
