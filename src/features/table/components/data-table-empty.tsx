'use client'

import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'

interface DataTableEmptyProps {
  onCreateTask?: () => void
}

export function DataTableEmpty({ onCreateTask }: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
        <FileText className="text-muted-foreground h-10 w-10" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">タスクがありません</h3>
      <p className="text-muted-foreground mt-2 text-center text-sm">タスクを作成して、効率的に管理を始めましょう</p>
      {onCreateTask && (
        <Button onClick={onCreateTask} className="mt-6">
          <Plus className="mr-2 h-4 w-4" />
          タスクを作成
        </Button>
      )}
    </div>
  )
}
