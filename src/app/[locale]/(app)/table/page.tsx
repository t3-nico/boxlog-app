'use client'

import { Button } from '@/components/ui/button'
import { useChatStore } from '@/features/aichat/stores/useChatStore'
import { TaskTable } from '@/features/table'
import { clearTestTasks, seedTestTasks } from '@/features/table/__dev/seed-test-data'
import { cn } from '@/lib/utils'

const TablePage = () => {
  const { toggleChat: _toggleChat, isOpen } = useChatStore()

  return (
    <div className="bg-background relative flex h-full flex-col">
      <div className={cn('flex h-full flex-col p-4 transition-all duration-300', isOpen && 'mr-96')}>
        {/* 開発環境用：テストデータ追加ボタン */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted mb-4 flex items-center gap-2 rounded-md border p-2">
            <span className="text-muted-foreground text-sm">開発環境:</span>
            <Button size="sm" variant="outline" onClick={seedTestTasks}>
              テストデータ追加
            </Button>
            <Button size="sm" variant="outline" onClick={clearTestTasks}>
              全削除
            </Button>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <TaskTable />
        </div>
      </div>
    </div>
  )
}

export default TablePage
