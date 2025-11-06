'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useTagsPageContext } from '../contexts/TagsPageContext'
import { TagsSidebar } from './TagsSidebar'

/**
 * TagsSidebarWrapper - Contextから状態を取得してTagsSidebarに渡す
 *
 * DesktopLayoutから呼び出され、TagsPageContextのデータを使用する
 */
export function TagsSidebarWrapper() {
  const { isLoading } = useTagsPageContext()
  const router = useRouter()
  const pathname = usePathname()

  const handleAllTagsClick = useCallback(() => {
    // URLを /tags に変更
    const locale = pathname?.split('/')[1] || 'ja'
    router.push(`/${locale}/tags`)
  }, [router, pathname])

  return <TagsSidebar onAllTagsClick={handleAllTagsClick} isLoading={isLoading} />
}
