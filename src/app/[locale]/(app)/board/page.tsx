'use client'

import { KanbanBoard } from '@/features/board'
import { KanbanToolbar } from '@/features/board/components/KanbanToolbar'

export default function BoardPage() {
  return (
    <div className="flex h-full flex-col">
      {/* ツールバー: フィルター・検索 */}
      <div className="flex shrink-0 px-4 py-4 md:px-6">
        <KanbanToolbar />
      </div>

      {/* Kanbanボード: 残りのスペース */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  )
}
