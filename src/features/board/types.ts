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
 * タグ情報
 */
export const kanbanTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
})

export type KanbanTag = z.infer<typeof kanbanTagSchema>

/**
 * Kanbanカードスキーマ（Zodバリデーション）
 */
export const kanbanCardSchema = z.object({
  id: z.string().uuid(),
  planNumber: z.string().optional(), // プラン番号（#123形式で表示）
  title: z.string().min(1, 'validation.title.required').max(100, 'validation.title.maxLength'),
  description: z.string().max(1000, 'validation.description.maxLength').optional(),
  status: kanbanStatusSchema,
  priority: kanbanPrioritySchema,
  assignee: z.string().optional(),
  tags: z.array(z.union([z.string(), kanbanTagSchema])).default([]),
  dueDate: z.union([z.date(), z.string()]).optional(), // Date型または文字列（YYYY-MM-DD）
  startTime: z.union([z.date(), z.string()]).optional(), // 開始時刻（ISO 8601形式）
  endTime: z.union([z.date(), z.string()]).optional(), // 終了時刻（ISO 8601形式）
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
 * カラムの背景色（ClickUp風）
 */
export const kanbanColumnColorSchema = z.enum(['blue', 'purple', 'pink', 'green', 'yellow', 'orange', 'red', 'gray'])
export type KanbanColumnColor = z.infer<typeof kanbanColumnColorSchema>

/**
 * Kanbanカラム
 */
export interface KanbanColumn {
  id: string
  title: string
  status: KanbanStatus
  cards: KanbanCard[]
  order: number
  wipLimit?: number | undefined // WIP制限（Work In Progress Limit）
  definitionOfDone?: string[] | undefined // 完了定義（Definition of Done）
  color?: KanbanColumnColor | undefined // カラム背景色
}

/**
 * Kanbanボード
 */
export interface KanbanBoard {
  id: string
  name: string
  description?: string | undefined
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
  priority?: KanbanPriority | undefined
  tags?: string[] | undefined
  assignee?: string | undefined
  search?: string | undefined
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
