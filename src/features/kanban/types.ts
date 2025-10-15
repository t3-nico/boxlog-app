import { z } from 'zod'

/**
 * Kanbanカードのステータス
 */
export const kanbanStatusSchema = z.enum(['todo', 'in_progress', 'done'])
export type KanbanStatus = z.infer<typeof kanbanStatusSchema>

/**
 * 優先度
 */
export const kanbanPrioritySchema = z.enum(['low', 'medium', 'high'])
export type KanbanPriority = z.infer<typeof kanbanPrioritySchema>

/**
 * Kanbanカードスキーマ（Zodバリデーション）
 */
export const kanbanCardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内です'),
  description: z.string().max(1000, '説明は1000文字以内です').optional(),
  status: kanbanStatusSchema,
  priority: kanbanPrioritySchema,
  assignee: z.string().optional(),
  tags: z.array(z.string()).default([]),
  dueDate: z.date().optional(),
  isBlocked: z.boolean().default(false), // ブロック状態
  blockedReason: z.string().optional(), // ブロック理由
  startedAt: z.date().optional(), // 作業開始日時（サイクルタイム計測用）
  completedAt: z.date().optional(), // 完了日時（リードタイム計測用）
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type KanbanCard = z.infer<typeof kanbanCardSchema>

/**
 * カード作成時の入力データ（id, createdAt, updatedAtは自動生成）
 */
export type KanbanCardInput = Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt'>

/**
 * カード更新時の入力データ
 */
export type KanbanCardUpdate = Partial<Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt'>>

/**
 * Kanbanカラム
 */
export interface KanbanColumn {
  id: string
  title: string
  status: KanbanStatus
  cards: KanbanCard[]
  order: number
  wipLimit?: number // WIP制限（Work In Progress Limit）
  definitionOfDone?: string[] // 完了定義（Definition of Done）
}

/**
 * Kanbanボード
 */
export interface KanbanBoard {
  id: string
  name: string
  description?: string
  columns: KanbanColumn[]
  createdAt: Date
  updatedAt: Date
}

/**
 * ドラッグイベント（カード移動）
 */
export interface DragEvent {
  cardId: string
  sourceColumnId: string
  targetColumnId: string
  sourceIndex: number
  targetIndex: number
}

/**
 * フィルター条件
 */
export interface KanbanFilter {
  priority?: KanbanPriority
  tags?: string[]
  assignee?: string
  search?: string
}

/**
 * ソート条件
 */
export type KanbanSortKey = 'createdAt' | 'updatedAt' | 'priority' | 'title'
export type KanbanSortOrder = 'asc' | 'desc'

export interface KanbanSort {
  key: KanbanSortKey
  order: KanbanSortOrder
}
