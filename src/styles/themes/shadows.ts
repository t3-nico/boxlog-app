/**
 * 影の定義 - ボックスシャドウとドロップシャドウの統一設定
 */

// 基本的な影の定義（Tailwindベース）
export const boxShadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const

// ダークモード用の影（より濃く）
export const darkBoxShadow = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
} as const

// コンポーネント別影設定
export const componentShadows = {
  // カード
  card: {
    default: boxShadow.sm,
    hover: boxShadow.md,
    active: boxShadow.xs,
    dark: {
      default: darkBoxShadow.sm,
      hover: darkBoxShadow.md,
      active: darkBoxShadow.xs,
    },
  },
  
  // ドロップダウン・ポップオーバー
  dropdown: {
    default: boxShadow.lg,
    dark: darkBoxShadow.lg,
  },
  
  // モーダル
  modal: {
    default: boxShadow.xl,
    dark: darkBoxShadow.xl,
  },
  
  // ボタン
  button: {
    default: boxShadow.xs,
    hover: boxShadow.sm,
    active: boxShadow.inner,
    dark: {
      default: darkBoxShadow.xs,
      hover: darkBoxShadow.sm,
      active: darkBoxShadow.inner,
    },
  },
  
  // 入力フィールド
  input: {
    default: boxShadow.xs,
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)', // blue-500 with opacity
    error: '0 0 0 3px rgba(239, 68, 68, 0.1)',  // red-500 with opacity
    dark: {
      default: darkBoxShadow.xs,
      focus: '0 0 0 3px rgba(96, 165, 250, 0.2)', // blue-400 with opacity
      error: '0 0 0 3px rgba(248, 113, 113, 0.2)', // red-400 with opacity
    },
  },
  
  // ツールチップ
  tooltip: {
    default: boxShadow.md,
    dark: darkBoxShadow.md,
  },
} as const

// カレンダー専用影設定
export const calendarShadows = {
  // イベントブロック
  eventBlock: {
    default: boxShadow.xs,
    hover: boxShadow.sm,
    dragging: boxShadow.lg,
    dark: {
      default: darkBoxShadow.xs,
      hover: darkBoxShadow.sm,
      dragging: darkBoxShadow.lg,
    },
  },
  
  // ポップアップ
  popup: {
    default: boxShadow.xl,
    dark: darkBoxShadow.xl,
  },
  
  // ミニカレンダー
  miniCalendar: {
    default: boxShadow.sm,
    dark: darkBoxShadow.sm,
  },
  
  // 現在時刻線のドット
  currentTimeDot: {
    default: boxShadow.sm,
    dark: darkBoxShadow.sm,
  },
  
  // ドラッグプレビュー
  dragPreview: {
    default: '0 0 0 8px rgba(59, 130, 246, 0.2)', // blue-500 pulse effect
    dark: '0 0 0 8px rgba(96, 165, 250, 0.2)',    // blue-400 pulse effect
  },
} as const

// フォーカスリング（アクセシビリティ）
export const focusRing = {
  default: '0 0 0 2px rgba(59, 130, 246, 0.5)',  // blue-500
  error: '0 0 0 2px rgba(239, 68, 68, 0.5)',     // red-500
  success: '0 0 0 2px rgba(34, 197, 94, 0.5)',   // green-500
  warning: '0 0 0 2px rgba(245, 158, 11, 0.5)',  // amber-500
  dark: {
    default: '0 0 0 2px rgba(96, 165, 250, 0.5)', // blue-400
    error: '0 0 0 2px rgba(248, 113, 113, 0.5)',  // red-400
    success: '0 0 0 2px rgba(74, 222, 128, 0.5)', // green-400
    warning: '0 0 0 2px rgba(251, 191, 36, 0.5)', // amber-400
  },
} as const

// グラデーション影（特殊効果）
export const gradientShadows = {
  glass: {
    light: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    dark: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  colored: {
    blue: '0 4px 14px 0 rgba(59, 130, 246, 0.2)',
    green: '0 4px 14px 0 rgba(34, 197, 94, 0.2)',
    red: '0 4px 14px 0 rgba(239, 68, 68, 0.2)',
    amber: '0 4px 14px 0 rgba(245, 158, 11, 0.2)',
  },
} as const

// 型定義
export type BoxShadowKey = keyof typeof boxShadow
export type ComponentShadowType = keyof typeof componentShadows
export type CalendarShadowType = keyof typeof calendarShadows
export type FocusRingType = keyof typeof focusRing