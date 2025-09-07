/**
 * BoxLog カラーシステム
 * ライト/ダークモード完全対応
 * 
 * 色の使い分け：
 * - Primary（青）: メインボタンのみ
 * - Secondary（グレー）: 副次ボタン、キャンセル等
 * - Selection（薄い青）: 選択状態、ホバー背景
 * - Neutral: すべての基本色
 */

// ============================================
// プライマリーカラー（青 - メインボタン専用）
// ============================================

/**
 * プライマリーカラー
 * @description メインアクションボタン専用
 * @usage 新規作成、保存、送信など最重要アクションのみ
 * @light blue-600
 * @dark blue-500
 */
export const primary = {
  // ボタン背景
  DEFAULT: 'bg-blue-600 dark:bg-blue-500',
  hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
  active: 'active:bg-blue-800 dark:active:bg-blue-700',
  disabled: 'disabled:bg-blue-300 dark:disabled:bg-blue-800',
  
  // テキスト（ボタン内の白文字）
  text: 'text-white',  // ボタン内は常に白
  
  // フォーカスリング
  ring: 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2',
} as const

// ============================================
// セカンダリーカラー（Neutral系 - 副次ボタン用）
// ============================================

/**
 * セカンダリーカラー
 * @description 副次的なボタン・アクション
 * @usage キャンセル、戻る、閉じる、リセットなど
 * @note すべてNeutral系で統一
 */
export const secondary = {
  // ボタン背景（グレー、elevatedレベル）
  DEFAULT: 'bg-neutral-300 dark:bg-neutral-700',
  hover: 'hover:bg-neutral-400 dark:hover:bg-neutral-600',
  active: 'active:bg-neutral-500 dark:active:bg-neutral-500',
  disabled: 'disabled:bg-neutral-200 dark:disabled:bg-neutral-800',
  
  // テキスト（強いコントラスト）
  text: 'text-neutral-900 dark:text-neutral-100',
  
  // ボーダー（アウトラインボタン用）
  border: 'border border-neutral-200 dark:border-neutral-800',
  
  // リング
  ring: 'ring-2 ring-neutral-400 dark:ring-neutral-600 ring-offset-2',
  
  // 今日ハイライト（当日表示用）
  today: 'bg-neutral-400 dark:bg-neutral-600',
} as const

// ============================================
// 選択状態（薄い青 - インタラクション用）
// ============================================

/**
 * 選択・ホバー状態
 * @description リストアイテムやカードの選択状態
 * @usage サイドバー選択、リストアイテムホバー、カード選択
 * @note ボタンには使用しない
 */
export const selection = {
  // 背景（薄い青、backgroundより少し明るく）
  DEFAULT: 'bg-blue-50 dark:bg-blue-950/50',
  hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/70',
  active: 'active:bg-blue-200 dark:active:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/40',
  
  // ボーダー（左の青いバー）
  border: 'border-l-2 border-blue-600 dark:border-blue-400',
  
  // テキスト（選択時に少し濃く、コントラスト強化）
  text: 'text-blue-800 dark:text-blue-200',
} as const


// ============================================
// ゴーストボタン（透明 - 最小限のボタン）
// ============================================

/**
 * ゴーストボタン
 * @description 背景なしの最小限ボタン
 * @usage もっと見る、ヘルプ、オプションなど
 */
export const ghost = {
  // テキスト
  text: 'text-neutral-700 dark:text-neutral-300',
  
  // ホバー時のみ背景
  hover: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
  active: 'active:bg-neutral-200 dark:active:bg-neutral-700',
  
  // リング
  ring: 'focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600',
} as const

// ============================================
// 背景色システム（Neutral系）
// ============================================

/**
 * 背景色
 * @description アプリ全体の背景レイヤー
 * @note whiteは使わず、すべてneutral系
 */
export const background = {
  // レベル0: ページ背景（最も明るい/暗い）
  base: 'bg-neutral-100 dark:bg-neutral-900',
  
  // レベル1: カード・セクション
  surface: 'bg-neutral-200 dark:bg-neutral-800',  // カードは白OK
  
  // レベル2: ネストされた要素
  elevated: 'bg-neutral-300 dark:bg-neutral-700',
} as const

// ============================================
// テキストカラー（Neutral系）
// ============================================

/**
 * テキストカラー
 * @description 文字色の階層
 */
export const text = {
  // 見出し・重要（最も濃い、背景とのコントラスト確保）
  primary: 'text-neutral-900 dark:text-neutral-100',
  
  // 本文（少し薄い）
  secondary: 'text-neutral-800 dark:text-neutral-200',
  
  // 補助・説明（さらに薄い）
  muted: 'text-neutral-600 dark:text-neutral-400',
  
  // 無効（最も薄い）
  disabled: 'text-neutral-500 dark:text-neutral-500',
  
  // ボタン内の白文字
  white: 'text-white',
  
  // リンク（Neutral系）
  link: 'text-neutral-800 dark:text-neutral-300 underline underline-offset-2',
  linkHover: 'hover:text-neutral-900 dark:hover:text-neutral-100',
} as const

// ============================================
// ボーダーカラー（Neutral系）
// ============================================

/**
 * ボーダーカラー
 * @description 境界線の濃さ
 */
export const border = {
  // 既存（モード別）
  subtle: 'border-neutral-50 dark:border-neutral-950',
  DEFAULT: 'border-neutral-100 dark:border-neutral-900',
  strong: 'border-neutral-200 dark:border-neutral-800',
  
  // 🆕 汎用（追加）
  universal: 'border-neutral-900/20 dark:border-neutral-100/20',  // alphaスタイル
  
  // 🆕 透明度ベース（オプション）
  alpha: 'border-neutral-900/20 dark:border-neutral-100/20',
} as const

// ============================================
// セマンティックカラー（状態表示）
// ============================================

/**
 * セマンティックカラー
 * @description 意味を持つ色
 * @usage 成功、エラー、警告メッセージ
 */
export const semantic = {
  // 成功
  success: {
    DEFAULT: 'bg-green-600 dark:bg-green-500',
    light: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-600 dark:border-green-500',
  },
  
  // エラー・削除
  error: {
    DEFAULT: 'bg-red-600 dark:bg-red-500',
    light: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-600 dark:border-red-500',
  },
  
  // 警告
  warning: {
    DEFAULT: 'bg-amber-600 dark:bg-amber-500',
    light: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-600 dark:border-amber-500',
  },
  
  // 情報
  info: {
    DEFAULT: 'bg-blue-600 dark:bg-blue-500',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-600 dark:border-blue-500',
  },
} as const

// ============================================
// 状態表現
// ============================================

/**
 * 状態
 * @description UI要素の状態表現
 */
export const state = {
  // 無効
  disabled: {
    opacity: 'opacity-50',
    cursor: 'cursor-not-allowed',
  },
  
  // ローディング
  loading: {
    opacity: 'opacity-75',
    cursor: 'cursor-wait',
  },
  
  // フォーカス（Neutral系）
  focus: {
    ring: 'ring-2 ring-neutral-400 dark:ring-neutral-600 ring-offset-2',
    outline: 'outline-none',
  },
} as const

// ============================================
// ボタンユーティリティ（組み合わせ済み）
// ============================================

/**
 * ボタンスタイル
 * @description よく使うボタンの完全なスタイル
 */
export const button = {
  // メインアクション（青）
  primary: `${primary.DEFAULT} ${primary.hover} ${primary.active} ${primary.text} ${primary.ring} ${state.focus.outline}`,
  
  // サブアクション（グレー）
  secondary: `${secondary.DEFAULT} ${secondary.hover} ${secondary.active} ${secondary.text} ${secondary.ring} ${state.focus.outline}`,
  
  // ゴースト（透明）
  ghost: `${ghost.text} ${ghost.hover} ${ghost.active} ${ghost.ring} ${state.focus.outline}`,
  
  // アウトライン（枠線）
  outline: `${secondary.border} ${secondary.text} ${ghost.hover} ${secondary.ring} ${state.focus.outline}`,
  
  // 削除（赤）
  danger: `${semantic.error.DEFAULT} ${text.white} hover:bg-red-700 dark:hover:bg-red-600 ${state.focus.outline}`,
} as const

// ============================================
// 統合colorsオブジェクト
// ============================================

/**
 * すべての色定義を統合したオブジェクト
 */
export const colors = {
  primary,
  secondary,
  selection,
  text,
  background,
  border,
  semantic,
  state,
  button,
  ghost
} as const