'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Edit, MoreVertical, Trash } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Task } from '@/types'

interface MobileTaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

const statusVariantMap = {
  backlog: 'outline' as const,
  scheduled: 'default' as const,
  in_progress: 'secondary' as const,
  completed: 'default' as const,
  stopped: 'destructive' as const,
}

const priorityVariantMap = {
  low: 'outline' as const,
  medium: 'default' as const,
  high: 'secondary' as const,
  urgent: 'destructive' as const,
}

const statusLabelMap = {
  backlog: 'バックログ',
  scheduled: 'スケジュール済み',
  in_progress: '進行中',
  completed: '完了',
  stopped: '停止',
}

const priorityLabelMap = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
}

export function MobileTaskCard({ task, onEdit, onDelete }: MobileTaskCardProps) {
  const date = new Date(task.planned_start)
  const hours = Math.floor(task.planned_duration / 60)
  const minutes = task.planned_duration % 60

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="leading-none font-semibold tracking-tight">{task.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={statusVariantMap[task.status]}>{statusLabelMap[task.status]}</Badge>
              <Badge variant={priorityVariantMap[task.priority]}>{priorityLabelMap[task.priority]}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {task.description && <p className="text-muted-foreground text-sm">{task.description}</p>}
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <div>
            <span className="font-medium">開始予定:</span> {format(date, 'yyyy/MM/dd HH:mm', { locale: ja })}
          </div>
          <div>
            <span className="font-medium">予定時間:</span> {hours > 0 && `${hours}時間`}
            {minutes > 0 && `${minutes}分`}
          </div>
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
