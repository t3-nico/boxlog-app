'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'
import { Button } from '@/components/shadcn-ui/button'
import { Plus, GripVertical } from 'lucide-react'
import { background, text, border } from '@/config/theme/colors'
import { typography } from '@/config/theme'

// 仮のタスクデータ型
interface UnscheduledTask {
  id: string
  title: string
  description?: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
}

// 仮のデータ
const mockTasks: UnscheduledTask[] = [
  {
    id: '1',
    title: 'プロジェクト企画書作成',
    priority: 'high',
    tags: ['仕事', '企画']
  },
  {
    id: '2', 
    title: 'ミーティング資料準備',
    priority: 'medium',
    tags: ['仕事']
  },
  {
    id: '3',
    title: '買い物リスト作成',
    priority: 'low',
    tags: ['個人']
  }
]

export function UnscheduledTasksList() {
  const handleTaskDragStart = (e: React.DragEvent, task: UnscheduledTask) => {
    // ドラッグデータにタスク情報を設定
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'unscheduled-task',
      task: task
    }))
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500' 
      case 'low': return 'border-l-blue-500'
      default: return 'border-l-gray-300'
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-0">
        {/* ヘッダー */}
        <div className={cn('p-4 border-b', border.universal)}>
          <div className="flex items-center justify-between">
            <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>
              未予定タスク
            </h3>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* タスクリスト */}
        <div className="space-y-0">
          {mockTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleTaskDragStart(e, task)}
              className={cn(
                'p-4 border-b border-l-4 cursor-move transition-colors hover:bg-accent/50',
                border.universal,
                getPriorityColor(task.priority),
                background.base
              )}
            >
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <h4 className={cn(typography.body.DEFAULT, 'font-medium', text.primary)}>
                    {task.title}
                  </h4>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            'px-2 py-1 rounded-full',
                            typography.body.small,
                            'bg-accent text-accent-foreground'
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状態 */}
        {mockTasks.length === 0 && (
          <div className="p-8 text-center">
            <p className={cn(typography.body.DEFAULT, text.muted)}>
              未予定のタスクはありません
            </p>
            <Button variant="ghost" size="sm" className="mt-2">
              <Plus className="w-4 h-4 mr-1" />
              タスクを追加
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}