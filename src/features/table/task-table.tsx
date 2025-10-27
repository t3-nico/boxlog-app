// TODO(#621): Tasks削除後、Sessions表示に移行予定
'use client'

// import { useTaskStore } from '@/features/tasks/stores/useTaskStore'
import type { Task } from '@/types'
import { getColumns } from './components/columns'
import { DataTable } from './components/data-table'

/**
 * TaskをTableTask形式に変換
 */
// function convertToTableTask(task: {
//   id: string
//   title: string
//   description?: string
//   status: Task['status']
//   priority: Task['priority']
//   planned_start: Date
//   planned_duration: number
//   tags?: string[]
//   created_at: Date
//   updated_at: Date
//   user_id?: string
// }): Task {
//   return {
//     id: task.id,
//     title: task.title,
//     description: task.description,
//     status: task.status,
//     priority: task.priority,
//     planned_start: task.planned_start.toISOString(),
//     planned_duration: task.planned_duration,
//     tags: task.tags,
//     created_at: task.created_at.toISOString(),
//     updated_at: task.updated_at.toISOString(),
//     user_id: task.user_id || '',
//   }
// }

export function TaskTable() {
  // const { tasks, updateTask } = useTaskStore()
  // const tableTasks = tasks.map(convertToTableTask)
  const tableTasks: Task[] = [] // 一時的に空配列

  // ステータス更新ハンドラー
  const handleUpdateStatus = (_taskId: string, _status: Task['status']) => {
    // updateTask(taskId, { status })
    console.log('TODO: Sessions統合後に実装')
  }

  // 優先度更新ハンドラー
  const handleUpdatePriority = (_taskId: string, _priority: Task['priority']) => {
    // updateTask(taskId, { priority })
    console.log('TODO: Sessions統合後に実装')
  }

  // カラム定義を取得
  const columns = getColumns(handleUpdateStatus, handleUpdatePriority)

  return <DataTable columns={columns} data={tableTasks} />
}
