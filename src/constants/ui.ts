/**
 * UI定数（ポップアップ系サイズ）
 *
 * Tailwindスケール準拠（rem単位）
 * 8pxグリッドシステムに対応
 */

/**
 * ダイアログ幅（max-width）
 *
 * Tailwindの max-w-* スケールに準拠
 */
export const DIALOG_WIDTH = {
  sm: 'max-w-sm', // 384px (24rem)
  md: 'max-w-md', // 448px (28rem)
  lg: 'max-w-lg', // 512px (32rem)
  xl: 'max-w-xl', // 576px (36rem)
  '2xl': 'max-w-2xl', // 672px (42rem)
  '3xl': 'max-w-3xl', // 768px (48rem)
  '4xl': 'max-w-4xl', // 896px (56rem)
} as const

/**
 * ダイアログ高さ
 *
 * rem単位で定義（8pxグリッド準拠）
 */
export const DIALOG_HEIGHT = {
  sm: 'h-[24rem]', // 384px
  md: 'h-[28rem]', // 448px
  lg: 'h-[32rem]', // 512px
  xl: 'h-[36rem]', // 576px ← 設定ダイアログ
  '2xl': 'h-[42rem]', // 672px
} as const

/**
 * サイドバー幅
 *
 * Tailwindの w-* スケールに準拠
 */
export const SIDEBAR_WIDTH = {
  sm: 'w-40', // 160px (10rem)
  md: 'w-48', // 192px (12rem) ← 設定サイドバー
  lg: 'w-56', // 224px (14rem)
  xl: 'w-64', // 256px (16rem)
} as const

/**
 * ドロップダウン幅
 */
export const DROPDOWN_WIDTH = {
  sm: 'w-48', // 192px
  md: 'w-56', // 224px
  lg: 'w-64', // 256px
} as const

/**
 * ダイアログプリセット
 *
 * 用途別のダイアログサイズ設定
 */
export const DIALOG_PRESET = {
  /** 設定ダイアログ（2カラムレイアウト） */
  settings: {
    width: DIALOG_WIDTH['2xl'],
    height: DIALOG_HEIGHT.xl,
    sidebarWidth: SIDEBAR_WIDTH.md,
  },
  /** フォームダイアログ（作成・編集） */
  form: {
    width: DIALOG_WIDTH.md,
  },
  /** 確認ダイアログ（削除・アーカイブ） */
  confirm: {
    width: DIALOG_WIDTH.lg,
  },
  /** 詳細ダイアログ（カード詳細など） */
  detail: {
    width: DIALOG_WIDTH.xl,
  },
} as const

/**
 * 設定ダイアログ専用定数（後方互換用）
 * @deprecated DIALOG_PRESET.settings を使用してください
 */
export const SETTINGS_DIALOG = DIALOG_PRESET.settings
