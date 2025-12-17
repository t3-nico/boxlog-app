/**
 * Inspector Feature
 *
 * 詳細パネル（Inspector/Sheet）の共通基盤
 * Plans/Tags 等で統一的なInspector UIを提供
 *
 * ## コンポーネント
 *
 * - `InspectorShell`: Sheet/Dialog切り替え、リサイズ、z-index管理
 * - `InspectorHeader`: ナビゲーション、閉じるボタン、メニュー
 * - `InspectorContent`: ローディング/空状態の統一処理
 *
 * ## Hooks
 *
 * - `useInspectorResize`: リサイズロジック
 * - `useInspectorKeyboard`: キーボードショートカット
 *
 * ## Store Factory
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

// Components
export { InspectorContent, InspectorHeader, InspectorShell, type InspectorDisplayMode } from './components'

// Hooks
export { INSPECTOR_SIZE, useInspectorKeyboard, useInspectorResize } from './hooks'

// Store factories
export { createExtendedInspectorStore, createInspectorStore } from './stores'

// Types
export type {
  CreateExtendedInspectorStoreConfig,
  CreateInspectorStoreConfig,
  ExtendedInspectorActions,
  ExtendedInspectorState,
  ExtendedInspectorStore,
  InspectorActions,
  InspectorDisplayMode as InspectorDisplayModeStore,
  InspectorState,
  InspectorStore,
} from './stores'
