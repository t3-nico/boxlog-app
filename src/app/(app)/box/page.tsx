import TasksTable from './tasks-table'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tasks',
}

export default function TasksPage() {
  return <TasksTable />
}
