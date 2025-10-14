'use client'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Task } from '@/types'
import { useState } from 'react'

interface EditableStatusCellProps {
  status: Task['status']
  onUpdate: (status: Task['status']) => void
}

const statusVariantMap = {
  backlog: 'outline' as const,
  scheduled: 'default' as const,
  in_progress: 'secondary' as const,
  completed: 'default' as const,
  stopped: 'destructive' as const,
}

const statusLabelMap = {
  backlog: 'バックログ',
  scheduled: 'スケジュール済み',
  in_progress: '進行中',
  completed: '完了',
  stopped: '停止',
}

export function EditableStatusCell({ status, onUpdate }: EditableStatusCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <Select
        value={status}
        onValueChange={(value) => {
          onUpdate(value as Task['status'])
          setIsEditing(false)
        }}
        open={isEditing}
        onOpenChange={setIsEditing}
      >
        <SelectTrigger className="h-auto w-auto border-0 p-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="backlog">
            <Badge variant="outline">バックログ</Badge>
          </SelectItem>
          <SelectItem value="scheduled">
            <Badge variant="default">スケジュール済み</Badge>
          </SelectItem>
          <SelectItem value="in_progress">
            <Badge variant="secondary">進行中</Badge>
          </SelectItem>
          <SelectItem value="completed">
            <Badge variant="default">完了</Badge>
          </SelectItem>
          <SelectItem value="stopped">
            <Badge variant="destructive">停止</Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Badge variant={statusVariantMap[status]} className="cursor-pointer" onClick={() => setIsEditing(true)}>
      {statusLabelMap[status]}
    </Badge>
  )
}
