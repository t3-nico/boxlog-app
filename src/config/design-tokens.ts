/**
 * BoxLog Design Tokens
 * Tailwind公式準拠のデザイントークン定義
 *
 * 使用例:
 * import { designTokens } from '@/config/design-tokens'
 * <div className={designTokens.colors.background.base}>
 */

// ============================================
// Colors - カラーシステム
// ============================================

export const colors = {
  // 背景色
  background: {
    base: 'bg-neutral-100 dark:bg-neutral-900',
    surface: 'bg-neutral-200 dark:bg-neutral-800',
    card: 'bg-white dark:bg-neutral-800',
    elevated: 'bg-neutral-300 dark:bg-neutral-700',
    subtle: 'bg-neutral-50 dark:bg-neutral-950',
  },

  // テキスト色
  text: {
    primary: 'text-neutral-900 dark:text-neutral-100',
    secondary: 'text-neutral-800 dark:text-neutral-200',
    muted: 'text-neutral-600 dark:text-neutral-400',
    disabled: 'text-neutral-500 dark:text-neutral-500',
    white: 'text-white',
    link: 'text-neutral-800 dark:text-neutral-300 underline underline-offset-2',
  },

  // アクションカラー
  primary: {
    default: 'bg-blue-600 dark:bg-blue-500',
    hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
    active: 'active:bg-blue-800 dark:active:bg-blue-700',
    text: 'text-white',
  },

  secondary: {
    default: 'bg-neutral-300 dark:bg-neutral-700',
    hover: 'hover:bg-neutral-400 dark:hover:bg-neutral-600',
    active: 'active:bg-neutral-500 dark:active:bg-neutral-500',
    text: 'text-neutral-900 dark:text-neutral-100',
  },

  // 選択状態
  selection: {
    default: 'bg-blue-50 dark:bg-blue-950/50',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/70',
    active: 'active:bg-blue-200 dark:active:bg-blue-900/40',
    border: 'border-l-2 border-blue-600 dark:border-blue-400',
    text: 'text-blue-800 dark:text-blue-200',
  },

  // セマンティックカラー
  semantic: {
    success: {
      default: 'bg-green-600 dark:bg-green-500',
      light: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-600 dark:border-green-500',
    },
    warning: {
      default: 'bg-orange-600 dark:bg-orange-500',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-600 dark:border-orange-500',
    },
    error: {
      default: 'bg-red-600 dark:bg-red-500',
      light: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-600 dark:border-red-500',
      hover: 'hover:bg-red-700 dark:hover:bg-red-600',
    },
    info: {
      default: 'bg-blue-600 dark:bg-blue-500',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-600 dark:border-blue-500',
    },
  },

  // ボーダー
  border: {
    subtle: 'border-neutral-50 dark:border-neutral-950',
    default: 'border-neutral-100 dark:border-neutral-900',
    strong: 'border-neutral-200 dark:border-neutral-800',
    universal: 'border-neutral-900/20 dark:border-neutral-100/20',
  },
} as const

// ============================================
// Typography - タイポグラフィ
// ============================================

export const typography = {
  heading: {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-bold tracking-tight',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
    h5: 'text-lg font-medium',
    h6: 'text-base font-medium',
  },

  body: {
    lg: 'text-lg leading-relaxed',
    base: 'text-base leading-normal',
    sm: 'text-sm leading-normal',
    xs: 'text-xs leading-tight',
  },

  weight: {
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  },

  align: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  },
} as const

// ============================================
// Spacing - スペーシング（8pxグリッド）
// ============================================

export const spacing = {
  // コンポーネント
  component: {
    navbar: 'px-6 py-4',
    sidebar: 'p-6',
    modal: 'p-6',
    card: 'p-6',
    section: 'py-8',
    divider: 'my-4',
  },

  // ページレイアウト
  page: {
    default: 'px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12',
    compact: 'px-4 py-6 md:px-6 md:py-8',
    full: 'p-0',
  },

  // セクション
  section: {
    default: 'mb-12',
    compact: 'mb-8',
    large: 'mb-16',
  },

  // Stack（縦積み）
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },

  // Inline（横並び）
  inline: {
    xs: 'flex gap-2',
    sm: 'flex gap-4',
    md: 'flex gap-6',
    lg: 'flex gap-8',
    xl: 'flex gap-12',
  },

  // Grid
  grid: {
    tight: 'gap-2',
    default: 'gap-4',
    loose: 'gap-6',
  },
} as const

// ============================================
// Borders & Radius - ボーダー・角丸
// ============================================

export const borders = {
  width: {
    none: 'border-0',
    default: 'border',
    thick: 'border-2',
  },

  style: {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  },
} as const

export const radius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  default: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const

// ============================================
// Shadows & Effects - シャドウ・エフェクト
// ============================================

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  default: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const

export const effects = {
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    default: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },

  animation: {
    spin: 'animate-spin',
    ping: 'animate-ping',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
  },
} as const

// ============================================
// Interactive States - インタラクティブ状態
// ============================================

export const states = {
  focus: {
    ring: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    outline: 'focus:outline-none',
  },

  disabled: {
    opacity: 'disabled:opacity-50',
    cursor: 'disabled:cursor-not-allowed',
  },

  loading: {
    opacity: 'opacity-75',
    cursor: 'cursor-wait',
  },
} as const

// ============================================
// Component Patterns - コンポーネントパターン
// ============================================

export const patterns = {
  // ボタン
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-md',
      lg: 'px-6 py-3 text-lg rounded-lg',
    },
  },

  // カード
  card: {
    base: 'rounded-lg shadow-md',
    interactive: 'rounded-lg shadow-md hover:shadow-lg transition-shadow',
  },

  // インプット
  input: {
    base: 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
  },

  // リンク
  link: {
    base: 'underline underline-offset-2 hover:no-underline transition-colors',
  },
} as const

// ============================================
// Export All - 統合エクスポート
// ============================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borders,
  radius,
  shadows,
  effects,
  states,
  patterns,
} as const

export type DesignTokens = typeof designTokens