import type { Metadata } from 'next'
import TasksBoard from '../tasks-board'

export const metadata: Metadata = {
  title: 'Tasks – Kanban',
}

export default function TasksKanbanPage() {
  return <TasksBoard />
}
