'use client'

import { Button } from '@/components/ui/button'
import { TaskTable } from '@/features/table'
import { clearTestTasks, seedTestTasks } from '@/features/table/__dev/seed-test-data'

const TablePage = () => {
  return (
    <div className="bg-background flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">タスク</h2>
          <p className="text-muted-foreground">タスク一覧を表示・管理します</p>
        </div>
        {/* 開発環境用：テストデータ追加ボタン */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={seedTestTasks}>
              テストデータ追加
            </Button>
            <Button size="sm" variant="outline" onClick={clearTestTasks}>
              全削除
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <TaskTable />
      </div>
    </div>
  )
}

export default TablePage
