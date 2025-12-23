'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useLocale } from 'next-intl'

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
  const isDesktop = useMediaQuery('(min-width: 768px)')

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
