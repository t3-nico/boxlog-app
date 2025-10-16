import { KanbanBoard } from '@/features/board/components/KanbanBoard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Board | BoxLog',
  description: 'タスクを視覚的に管理できるKanbanボード',
}

export default function BoardPage() {
  return <KanbanBoard />
}
