import { createExtendedInspectorStore } from '@/features/inspector';

/**
 * タグ新規作成時の初期データ
 */
export interface TagInitialData {
  name?: string;
  color?: string;
  description?: string;
  groupId?: string | null;
}

/**
 * Tag Inspector状態管理
 *
 * features/inspector の createExtendedInspectorStore を使用
 * - タグ詳細のSheet/Popover表示を制御
 * - 新規作成モード対応（entityId: null）
 *
 * @example
 * ```ts
 * const { isOpen, entityId, displayMode, openInspector, closeInspector, setDisplayMode } = useTagInspectorStore()
 *
 * // 既存タグを開く
 * openInspector('tag-123')
 *
 * // 新規作成モードで開く
 * openInspector(null, { initialData: { groupId: 'group-456' } })
 *
 * // Inspector を閉じる
 * closeInspector()
 * ```
 */
export const useTagInspectorStore = createExtendedInspectorStore<string, TagInitialData>({
  storeName: 'tag-inspector-store',
  persistKey: 'tag-inspector-settings',
});

/**
 * @deprecated entityId を使用してください
 */
export type TagId = string;
