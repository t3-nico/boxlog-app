/**
 * Inbox Group Type Definitions
 *
 * テーブルビューでのグループ化機能の型定義
 */

/**
 * グループ化フィールド
 *
 * テーブルをグループ分けできるフィールド
 */
export type GroupByField = 'status' | 'priority' | 'due_date' | 'tags' | null

/**
 * グループ化設定
 */
export type GroupConfig = {
  /** グループ化フィールド（nullの場合はグループ化なし） */
  field: GroupByField
  /** グループの折りたたみ状態（グループID → 折りたたみ状態） */
  collapsedGroups: Set<string>
}

/**
 * グループ化されたデータ
 *
 * @example
 * ```typescript
 * {
 *   groupKey: 'active',
 *   groupLabel: '作業中',
 *   items: [...],
 *   count: 5
 * }
 * ```
 */
export type GroupedData<T> = {
  /** グループのキー（一意な識別子） */
  groupKey: string
  /** グループの表示ラベル */
  groupLabel: string
  /** グループ内のアイテム */
  items: T[]
  /** アイテム数 */
  count: number
}
