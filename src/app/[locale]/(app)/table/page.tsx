'use client'

import { Button } from '@/components/ui/button'
import { TaskTable } from '@/features/table'
import { clearTestTasks, seedTestTasks } from '@/features/table/__dev/seed-test-data'

const TablePage = () => {
  return (
    <div className="flex h-full flex-col">
      {/* 開発環境用：テストデータ追加ボタン */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-2 md:px-6">
          <Button size="sm" variant="outline" onClick={seedTestTasks}>
            テストデータ追加
          </Button>
          <Button size="sm" variant="outline" onClick={clearTestTasks}>
            全削除
          </Button>
        </div>
      )}

      {/* テーブル: 残りのスペース */}
      <div className="flex-1 overflow-hidden px-4 pb-4 md:px-6 md:pb-6">
        <TaskTable />
      </div>
    </div>
  )
}

export default TablePage
