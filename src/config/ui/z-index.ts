/**
 * z-index階層定義
 *
 * UIコンポーネントのスタッキング順序を一元管理
 * 値が大きいほど前面に表示される
 *
 * 使用例:
 * - Tailwind: `z-[${zIndex.modal}]` または カスタムクラス
 * - インラインスタイル: `style={{ zIndex: zIndex.modal }}`
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
  /** ドロップダウンメニュー、セレクト、ツールチップ */
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

  /** ツールチップ（最前面に表示） */
  tooltip: 9999,
} as const

export type ZIndexKey = keyof typeof zIndex
export type ZIndexValue = (typeof zIndex)[ZIndexKey]

/**
 * Tailwindクラス用のz-index値を取得
 * @example getZIndexClass('modal') // 'z-[200]'
 */
export function getZIndexClass(key: ZIndexKey): string {
  return `z-[${zIndex[key]}]`
}
