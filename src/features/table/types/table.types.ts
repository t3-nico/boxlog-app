/**
 * Table View関連の型定義
 */

import type { Task } from '@/types'

/**
 * テーブル表示用のタスク型
 * TanStack Tableで使用
 */
export type TableTask = Task

/**
 * テーブルフィルター設定
 */
export interface TableFilters {
  status?: Task['status'][]
  priority?: Task['priority'][]
  tags?: string[]
  search?: string
}

/**
 * テーブルソート設定
 */
export interface TableSort {
  column: keyof Task
  direction: 'asc' | 'desc'
}

/**
 * テーブル設定（永続化用）
 */
export interface TableSettings {
  columnVisibility: Record<string, boolean>
  columnOrder: string[]
  pageSize: number
  filters: TableFilters
  sort: TableSort | null
}
