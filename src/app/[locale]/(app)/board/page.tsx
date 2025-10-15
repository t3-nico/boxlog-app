import { KanbanBoard } from '@/features/kanban/components/KanbanBoard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Board | BoxLog',
  description: 'タスクを視覚的に管理できるKanbanボード',
}

export default function BoardPage() {
  return (
    <div className="container mx-auto h-full py-6">
      <KanbanBoard />
    </div>
  )
}
