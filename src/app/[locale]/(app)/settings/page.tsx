'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSettingsDialogStore } from '@/features/settings/stores/useSettingsDialogStore'

/**
 * 設定ページ
 *
 * ページベースのルーティングからDialog形式に移行
 * このページにアクセスすると自動的にSettingsDialogを開いてHomeに遷移
 */
export default function SettingsPage() {
  const router = useRouter()
  const { openSettings } = useSettingsDialogStore()

  useEffect(() => {
    // Dialogを開く
    openSettings()

    // Homeページに遷移（URLを/settingsから変更）
    router.push('/')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // レンダリング中は何も表示しない（即座にリダイレクト）
  return null
}
