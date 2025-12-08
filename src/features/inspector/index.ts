/**
 * Inspector Feature
 *
 * 詳細パネル（Inspector/Sheet）の状態管理を提供
 * inbox/tags/plans 等で共通して使用する「基本デスク」
 *
 * ## Factory パターン
 *
 * 各ドメインで独自の Inspector store を作成する場合：
 *
 * @example
 * ```ts
 * // 基本的な Inspector（タグ詳細など）
 * import { createInspectorStore } from '@/features/inspector'
 *
 * export const useTagInspectorStore = createInspectorStore({
 *   storeName: 'tag-inspector-store',
 * })
 * ```
 *
 * @example
 * ```ts
 * // 拡張 Inspector（初期データ付き、プラン作成など）
 * import { createExtendedInspectorStore } from '@/features/inspector'
 *
 * interface PlanInitialData {
 *   start_time?: string
 *   end_time?: string
 * }
 *
 * export const usePlanInspectorStore = createExtendedInspectorStore<string, PlanInitialData>({
 *   storeName: 'plan-inspector-store',
 * })
 * ```
 */

// Store factories
export {
  createInspectorStore,
  createExtendedInspectorStore,
} from './stores'

// Types
export type {
  CreateInspectorStoreConfig,
  CreateExtendedInspectorStoreConfig,
  InspectorState,
  InspectorActions,
  InspectorStore,
  ExtendedInspectorState,
  ExtendedInspectorActions,
  ExtendedInspectorStore,
} from './stores'
