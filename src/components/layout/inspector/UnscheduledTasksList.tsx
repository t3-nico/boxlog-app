'use client'

import React, { useCallback } from 'react'

import { GripVertical, Plus } from 'lucide-react'

import { Button } from '@/components/shadcn-ui/button'
import { ScrollArea } from '@/components/shadcn-ui/scroll-area'

import { typography } from '@/config/theme'
import { border, text } from '@/config/theme/colors'
import { cn } from '@/lib/utils'

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
    tags: ['仕事', '企画'],
  },
  {
    id: '2',
    title: 'ミーティング資料準備',
    priority: 'medium',
    tags: ['仕事'],
  },
  {
    id: '3',
    title: '買い物リスト作成',
    priority: 'low',
    tags: ['個人'],
  },
]

export const UnscheduledTasksList = () => {
  const handleTaskDragStart = useCallback((e: React.DragEvent, task: UnscheduledTask) => {
    // ドラッグデータにタスク情報を設定
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'unscheduled-task',
        task,
      })
    )
  }, [])

  const createDragStartHandler = useCallback(
    (task: UnscheduledTask) => {
      return (e: React.DragEvent) => handleTaskDragStart(e, task)
    },
    [handleTaskDragStart]
  )

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-blue-500'
      default:
        return 'border-l-gray-300'
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-0">
        {/* ヘッダー */}
        <div className={cn('border-b p-4', border.universal)}>
          <div className="flex items-center justify-between">
            <h3 className={cn(typography.heading.h6, 'font-semibold', text.primary)}>未予定タスク</h3>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* タスクリスト */}
        <div className="space-y-0">
          {mockTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={createDragStartHandler(task)}
              className={cn(
                'hover:bg-accent/50 cursor-move border-b border-l-4 p-4 transition-colors',
                border.universal,
                getPriorityColor(task.priority),
                colors.background.base
              )}
            >
              <div className="flex items-start gap-3">
                <GripVertical className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div className="flex-1 space-y-1">
                  <h4 className={cn(typography.body.DEFAULT, 'font-medium', text.primary)}>{task.title}</h4>
                  {task.tags && task.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            'rounded-full px-2 py-1',
                            typography.body.small,
                            'bg-accent text-accent-foreground'
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状態 */}
        {mockTasks.length === 0 && (
          <div className="p-8 text-center">
            <p className={cn(typography.body.DEFAULT, text.muted)}>未予定のタスクはありません</p>
            <Button variant="ghost" size="sm" className="mt-2">
              <Plus className="mr-1 h-4 w-4" />
              タスクを追加
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
