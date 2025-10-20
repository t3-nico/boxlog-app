'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { Task } from '@/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar, Clock } from 'lucide-react'

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onSelect: (selected: boolean) => void
}

/**
 * モバイル用タスクカードコンポーネント
 *
 * 768px未満でテーブルの代わりに表示される
 * 重要な情報のみをカード形式で表示し、タップしやすいUIを提供
 */
export function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  // ステータスバッジの色を決定
  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return 'default' as const
      case 'in_progress':
        return 'secondary' as const
      case 'todo':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  // 優先度バッジの色を決定
  const getPriorityVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive' as const
      case 'medium':
        return 'default' as const
      case 'low':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  // ステータスラベル
  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return '完了'
      case 'in_progress':
        return '進行中'
      case 'todo':
        return 'バックログ'
      default:
        return status
    }
  }

  // 優先度ラベル
  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return priority
    }
  }

  return (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* 選択チェックボックス */}
          <Checkbox checked={isSelected} onCheckedChange={onSelect} className="mt-1" aria-label="タスクを選択" />

          <div className="flex-1 space-y-2">
            {/* タイトル */}
            <h3 className="leading-none font-semibold">{task.title}</h3>

            {/* ステータスと優先度 */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(task.status)}>{getStatusLabel(task.status)}</Badge>
              <Badge variant={getPriorityVariant(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-sm">
        {/* 開始予定 */}
        <div className="text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(task.planned_start), 'yyyy/MM/dd HH:mm', { locale: ja })}</span>
        </div>

        {/* 予定時間 */}
        <div className="text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {task.planned_duration >= 60
              ? `${Math.floor(task.planned_duration / 60)}時間${task.planned_duration % 60 > 0 ? `${task.planned_duration % 60}分` : ''}`
              : `${task.planned_duration}分`}
          </span>
        </div>

        {/* タグ */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
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
