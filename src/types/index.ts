/**
 * BoxLog 統一型定義
 *
 * TypeScript公式ベストプラクティス準拠:
 * - any型禁止
 * - interface優先（拡張可能性）
 * - type使用可（Union Types）
 *
 * 参考: .claude/code-standards.md
 */

// ============================================
// 1. 基本型定義（Union Types）
// ============================================

/**
 * タスクステータス（TypeScript公式: Union Type使用）
 */
export type TaskStatus =
  | 'backlog' // バックログ
  | 'scheduled' // スケジュール済み
  | 'in_progress' // 進行中
  | 'completed' // 完了
  | 'stopped' // 停止

/**
 * タスク優先度（TypeScript公式: Union Type使用）
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// ============================================
// 2. メインエンティティ（interface優先）
// ============================================

/**
 * タスクの種別（開発管理用の詳細タイプ）
 */
export type TaskType = 'feature' | 'bug' | 'improvement' | 'maintenance' | 'documentation'

/**
 * タスク（BoxLog統一型）
 * TypeScript公式: interface優先（拡張可能性）
 */
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type?: TaskType // タスク種別（オプショナル）
  planned_start: string // ISO 8601
  planned_duration: number // 分単位
  tags?: string[]
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
  user_id: string
}

/**
 * ユーザープロフィール
 */
export interface Profile {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

/**
 * ユーザー設定値
 */
export interface UserValues {
  id: string
  user_id: string
  key: string
  value: string
}

// ============================================
// 3. データ操作型（TypeScript公式: Utility Types活用）
// ============================================

/**
 * タスク作成入力
 * TypeScript公式: Omitユーティリティ型活用
 */
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>

/**
 * タスク更新入力
 * TypeScript公式: Partialユーティリティ型活用
 */
export type TaskUpdate = Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>

/**
 * プロフィール更新入力
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

// ============================================
// 4. 他モジュールからの再エクスポート
// ============================================

// 共通型
export * from './chronotype'
export * from './common'
export * from './smart-folders'
export * from './tags'
export * from './trash'

// 統一型（unified.tsから移行済みのためコメントアウト）
// export * from './unified'

// タスク型（task.tsから移行済みのためコメントアウト予定）
// export * from './task'
