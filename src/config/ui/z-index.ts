/**
 * z-index階層定義
 *
 * @deprecated Tailwindクラスを使用してください: z-modal, z-tooltip, z-dropdown など
 * 定義は globals.css の @theme セクションにあります。
 * ドキュメント: Storybook > Tokens > ZIndex
 *
 * UIコンポーネントのスタッキング順序を一元管理
 * 値が大きいほど前面に表示される
 *
 * 移行ガイド:
 * - `z-[${zIndex.modal}]` → `z-modal`
 * - `style={{ zIndex: zIndex.modal }}` → `className="z-modal"`
 *
 * 階層設計:
 * - dropdown/popover: 基本的なドロップダウン・ポップオーバー
 * - sheet: サイドシート・ドロワー
 * - modal: 通常のダイアログ・モーダル
 * - confirmDialog: 確認ダイアログ（削除など重要な操作）
 * - toast: トースト通知
 * - contextMenu: 右クリックメニュー
 * - tooltip: ツールチップ（最前面）
 */
export const zIndex = {
  /** ドロップダウンメニュー、セレクト（通常コンテキスト） */
  dropdown: 50,

  /** ポップオーバー（日付選択、カラーピッカーなど） */
  popover: 100,

  /** サイドシート、ドロワー（PlanInspectorなど） */
  sheet: 150,

  /** 通常のダイアログ・モーダル */
  modal: 200,

  /** 確認ダイアログ（削除、アーカイブなど重要な操作） */
  confirmDialog: 250,

  /** トースト通知 */
  toast: 300,

  /** コンテキストメニュー（右クリックメニュー） */
  contextMenu: 350,

  /** カレンダードラッグ選択プレビュー */
  calendarDragPreview: 1000,

  /** ドラッグ可能インスペクター背景 */
  draggableInspectorBackdrop: 1099,

  /** ドラッグ可能インスペクター */
  draggableInspector: 1100,

  /** オーバーレイ上のドロップダウン（Inspector内など） */
  overlayDropdown: 1200,

  /** ツールチップ（最前面に表示） */
  tooltip: 9999,
} as const;

export type ZIndexKey = keyof typeof zIndex;
export type ZIndexValue = (typeof zIndex)[ZIndexKey];

/**
 * Tailwindクラス用のz-index値を取得
 * @example getZIndexClass('modal') // 'z-[200]'
 */
export function getZIndexClass(key: ZIndexKey): string {
  return `z-[${zIndex[key]}]`;
}
