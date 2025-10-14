'use client'

import { useTaskStore } from '@/features/tasks/stores/useTaskStore'
import type { Task } from '@/types'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { MobileTaskCard } from './components/mobile-task-card'

/**
 * TaskをTableTask形式に変換
 */
function convertToTableTask(task: {
  id: string
  title: string
  description?: string
  status: Task['status']
  priority: Task['priority']
  planned_start: Date
  planned_duration: number
  tags?: string[]
  created_at: Date
  updated_at: Date
  user_id?: string
}): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    planned_start: task.planned_start.toISOString(),
    planned_duration: task.planned_duration,
    tags: task.tags,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
    user_id: task.user_id || '',
  }
}

export function TaskTable() {
  const { tasks } = useTaskStore()
  const tableTasks = tasks.map(convertToTableTask)

  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">タスク一覧</h2>
        <p className="text-muted-foreground">タスクを表形式で管理・閲覧できます</p>
      </div>

      {/* モバイル表示: カードレイアウト (768px未満) */}
      <div className="flex-1 space-y-4 md:hidden">
        {tableTasks.length > 0 ? (
          tableTasks.map((task) => <MobileTaskCard key={task.id} task={task} />)
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <p>タスクがありません</p>
          </div>
        )}
      </div>

      {/* デスクトップ表示: テーブルレイアウト (768px以上) */}
      <div className="hidden flex-1 md:flex md:flex-col">
        <DataTable columns={columns} data={tableTasks} />
      </div>
    </div>
  )
}
