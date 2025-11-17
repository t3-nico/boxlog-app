/**
 * Inbox View Type Definitions
 *
 * ユーザーがカスタマイズ可能なView（表示設定）の型定義
 */

/**
 * Display Mode
 * 表示形式（BoardビューまたはTableビュー）
 * Viewとは独立して、ユーザーがヘッダーで切り替え可能
 */
export type DisplayMode = 'board' | 'table'

/**
 * Inbox View Configuration
 *
 * ユーザーが保存できるView設定（フィルタ条件のみ）
 * 表示形式（Board/Table）はdisplayModeで別途管理
 *
 * @example
 * ```typescript
 * const myView: InboxView = {
 *   id: 'view-1',
 *   name: '高優先度タスク',
 *   filters: {
 *     priority: ['high', 'urgent'],
 *     status: ['open', 'in_progress']
 *   },
 *   isDefault: false,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export type InboxView = {
  /** View ID (UUID) */
  id: string

  /** View名（ユーザーが設定） */
  name: string

  /** フィルター設定 */
  filters: {
    /** ステータスフィルター */
    status?: string[]
    /** 優先度フィルター */
    priority?: string[]
    /** タグフィルター */
    tags?: string[]
    /** 検索キーワード */
    search?: string
    /** アーカイブ済みかどうか */
    archived?: boolean
  }

  /** ソート設定（将来拡張用） */
  sorting?: {
    field: string
    direction: 'asc' | 'desc'
  }

  /** Table view専用: 列設定 */
  columns?: Array<{
    id: string
    visible: boolean
    width: number
  }>

  /** Table view専用: ページサイズ */
  pageSize?: number

  /** デフォルトViewかどうか */
  isDefault?: boolean

  /** 作成日時 */
  createdAt: Date

  /** 更新日時 */
  updatedAt: Date
}

/**
 * View作成用の入力データ
 */
export type CreateInboxViewInput = {
  name: string
  filters?: InboxView['filters']
  sorting?: InboxView['sorting']
  isDefault?: boolean
}

/**
 * View更新用の入力データ
 */
export type UpdateInboxViewInput = Partial<Omit<InboxView, 'id' | 'createdAt' | 'updatedAt'>>
