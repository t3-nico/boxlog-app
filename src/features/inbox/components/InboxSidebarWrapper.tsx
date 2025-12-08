'use client'

import { useMemo } from 'react'

import { useInboxData } from '../hooks/useInboxData'
import { InboxSidebar } from './InboxSidebar'

/**
 * InboxSidebarWrapper - データを取得してInboxSidebarに渡す
 *
 * DesktopLayoutから呼び出され、InboxDataを使用する
 */
export function InboxSidebarWrapper() {
  const { items, isLoading } = useInboxData()

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

  return (
    <InboxSidebar isLoading={isLoading} activeplansCount={activePlansCount} archivedplansCount={archivedPlansCount} />
  )
}
