import { createInspectorStore } from '@/features/inspector'

/**
 * Tag Inspector状態管理
 *
 * features/inspector の createInspectorStore を使用
 * タグ詳細のSheet/Popover表示を制御
 *
 * @example
 * ```ts
 * const { isOpen, entityId, displayMode, openInspector, closeInspector, setDisplayMode } = useTagInspectorStore()
 *
 * // Inspector を開く
 * openInspector('tag-123')
 *
 * // 表示モードを変更
 * setDisplayMode('popover')
 *
 * // Inspector を閉じる
 * closeInspector()
 * ```
 */
export const useTagInspectorStore = createInspectorStore({
  storeName: 'tag-inspector-store',
  persistKey: 'tag-inspector-settings',
})

/**
 * @deprecated entityId を使用してください
 */
export type TagId = string
