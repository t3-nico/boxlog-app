'use client'

import { TaskTable } from '@/features/table'

const TablePage = () => {
  return (
    <div className="flex h-full flex-col">
      {/* テーブル: 残りのスペース */}
      <div className="flex-1 overflow-hidden px-4 py-4 md:px-6">
        <TaskTable />
      </div>
    </div>
  )
}

export default TablePage
