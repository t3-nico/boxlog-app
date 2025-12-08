import { createInspectorStore } from '@/features/inspector'

/**
 * Tag Inspector状態管理
 *
 * features/inspector の createInspectorStore を使用
 * タグ詳細のSheet表示を制御
 *
 * @example
 * ```ts
 * const { isOpen, entityId, openInspector, closeInspector } = useTagInspectorStore()
 *
 * // Inspector を開く
 * openInspector('tag-123')
 *
 * // Inspector を閉じる
 * closeInspector()
 * ```
 */
export const useTagInspectorStore = createInspectorStore({
  storeName: 'tag-inspector-store',
})

/**
 * @deprecated entityId を使用してください
 */
export type TagId = string
