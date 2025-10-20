'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { DesktopKanbanBoard } from './desktop/DesktopKanbanBoard'
import { MobileKanbanBoard } from './mobile/MobileKanbanBoard'

/**
 * Kanbanボードコンポーネント（メイン）
 *
 * レスポンシブ分岐：モバイル（lg未満）/デスクトップ（lg以上）
 *
 * @example
 * ```tsx
 * <KanbanBoard />
 * ```
 */
export function KanbanBoard() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return isDesktop ? <DesktopKanbanBoard /> : <MobileKanbanBoard />
}
