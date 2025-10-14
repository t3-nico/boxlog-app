'use client'

import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Task } from '@/types'
import { useState } from 'react'

interface EditablePriorityCellProps {
  priority: Task['priority']
  onUpdate: (priority: Task['priority']) => void
}

const priorityVariantMap = {
  low: 'outline' as const,
  medium: 'default' as const,
  high: 'secondary' as const,
  urgent: 'destructive' as const,
}

const priorityLabelMap = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
}

export function EditablePriorityCell({ priority, onUpdate }: EditablePriorityCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <Select
        value={priority}
        onValueChange={(value) => {
          onUpdate(value as Task['priority'])
          setIsEditing(false)
        }}
        open={isEditing}
        onOpenChange={setIsEditing}
      >
        <SelectTrigger className="h-auto w-auto border-0 p-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">
            <Badge variant="outline">低</Badge>
          </SelectItem>
          <SelectItem value="medium">
            <Badge variant="default">中</Badge>
          </SelectItem>
          <SelectItem value="high">
            <Badge variant="secondary">高</Badge>
          </SelectItem>
          <SelectItem value="urgent">
            <Badge variant="destructive">緊急</Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Badge variant={priorityVariantMap[priority]} className="cursor-pointer" onClick={() => setIsEditing(true)}>
      {priorityLabelMap[priority]}
    </Badge>
  )
}
