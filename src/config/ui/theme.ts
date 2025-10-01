/**
 * テーマカラー定義
 * 
 * アプリケーション全体で使用する色の定義
 * Tailwind CSSの標準カラーパレットを使用
 */

// ブランドカラー
export const BRAND_COLORS = {
  primary: 'rgb(59 130 246)', // blue-500
  secondary: 'rgb(115 115 115)', // neutral-500
  accent: 'rgb(34 197 94)', // green-500
} as const

// セマンティックカラー（用途別）
export const SEMANTIC_COLORS = {
  success: 'rgb(34 197 94)', // green-500
  warning: 'rgb(245 158 11)', // amber-500
  error: 'rgb(239 68 68)', // red-500
  info: 'rgb(59 130 246)', // blue-500
} as const

// タグ用のプリセットカラー
export const TAG_PRESET_COLORS = [
  'rgb(59 130 246)',   // Blue #3B82F6
  'rgb(16 185 129)',   // Emerald #10B981
  'rgb(245 158 11)',   // Amber #F59E0B
  'rgb(239 68 68)',    // Red #EF4444
  'rgb(139 92 246)',   // Violet #8B5CF6
  'rgb(6 182 212)',    // Cyan #06B6D4
  'rgb(132 204 22)',   // Lime #84CC16
  'rgb(249 115 22)',   // Orange #F97316
  'rgb(236 72 153)',   // Pink #EC4899
  'rgb(107 114 128)',  // Gray #6B7280
] as const

// タグカラーパレット（フル）
export const TAG_COLOR_PALETTE = [
  ['rgb(239 68 68)', 'rgb(249 115 22)', 'rgb(245 158 11)', 'rgb(234 179 8)'],
  ['rgb(132 204 22)', 'rgb(34 197 94)', 'rgb(16 185 129)', 'rgb(20 184 166)'],
  ['rgb(6 182 212)', 'rgb(14 165 233)', 'rgb(59 130 246)', 'rgb(99 102 241)'],
  ['rgb(139 92 246)', 'rgb(168 85 247)', 'rgb(217 70 239)', 'rgb(236 72 153)'],
] as const

// クロノタイプ用カラー
export const CHRONOTYPE_COLORS = {
  morning: 'rgb(59 130 246)',    // Morning person - Blue
  evening: 'rgb(139 92 246)',    // Evening person - Purple
  balanced: 'rgb(34 197 94)',    // Balanced - Green
} as const

// タスクステータスカラー
export const TASK_STATUS_COLORS = {
  todo: 'rgb(107 114 128)',      // Gray
  inProgress: 'rgb(59 130 246)', // Blue
  completed: 'rgb(34 197 94)',   // Green
  cancelled: 'rgb(239 68 68)',   // Red
} as const

// タスク優先度カラー
export const TASK_PRIORITY_COLORS = {
  high: 'rgb(239 68 68)',        // Red
  medium: 'rgb(245 158 11)',     // Yellow
  low: 'rgb(34 197 94)',         // Green
} as const

// デフォルト値（フォールバック用）
export const DEFAULT_TAG_COLOR = 'rgb(59 130 246)'
export const DEFAULT_BRAND_COLOR = 'rgb(59 130 246)'

// ヘルパー関数
export function getTagPresetColor(index: number): string {
  return TAG_PRESET_COLORS[index % TAG_PRESET_COLORS.length]
}

// 型定義
export type TagPresetColor = typeof TAG_PRESET_COLORS[number]
export type ChronotypeColor = keyof typeof CHRONOTYPE_COLORS
export type TaskStatusColor = keyof typeof TASK_STATUS_COLORS
export type TaskPriorityColor = keyof typeof TASK_PRIORITY_COLORS

// ========================================
// 統合テーマオブジェクト（後方互換性）
// ========================================

/**
 * colorsオブジェクト - globals.cssのCSS変数を参照
 * 旧コードとの互換性のために提供
 *
 * 注意: 実際の値はglobals.cssの@themeブロックで定義されています
 */
export const colors = {
  success: {
    DEFAULT: '#22c55e',  // var(--color-success-500)
    light: '#4ade80',    // green-400相当
    dark: '#16a34a',     // var(--color-success-600)
  },
  warning: {
    DEFAULT: '#f97316',  // var(--color-warning-500)
    light: '#fb923c',    // orange-400相当
    dark: '#ea580c',     // var(--color-warning-600)
  },
  error: {
    DEFAULT: '#ef4444',  // var(--color-error-500)
    light: '#f87171',    // red-400相当
    dark: '#dc2626',     // var(--color-error-600)
  },
  info: {
    DEFAULT: '#3b82f6',  // var(--color-info-500)
    light: '#60a5fa',    // blue-400相当
    dark: '#2563eb',     // var(--color-info-600)
  },
  primary: {
    DEFAULT: '#3b82f6',  // var(--color-primary-500)
    light: '#60a5fa',    // var(--color-primary-400)
    dark: '#2563eb',     // var(--color-primary-600)
    hover: '#2563eb',    // var(--color-primary-600)
  },
  secondary: {
    DEFAULT: '#6b7280',  // gray-500
    light: '#9ca3af',    // gray-400
    dark: '#4b5563',     // gray-600
  },
  accent: {
    DEFAULT: '#22c55e',  // green-500
    light: '#4ade80',    // green-400
    dark: '#16a34a',     // green-600
  },
  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-400',
  },
  background: {
    base: 'bg-white dark:bg-gray-950',
    accent: 'bg-gray-100 dark:bg-gray-800',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  border: {
    default: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:border-gray-300 dark:hover:border-gray-600',
  },
} as const

/**
 * typographyオブジェクト - フォントサイズ定義
 * Tailwind標準のテキストサイズ
 */
export const typography = {
  xs: '0.75rem',    // 12px - text-xs
  sm: '0.875rem',   // 14px - text-sm
  base: '1rem',     // 16px - text-base
  lg: '1.125rem',   // 18px - text-lg
  xl: '1.25rem',    // 20px - text-xl
  '2xl': '1.5rem',  // 24px - text-2xl
  '3xl': '1.875rem',// 30px - text-3xl
  '4xl': '2.25rem', // 36px - text-4xl
  heading: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-semibold',
  },
  body: {
    DEFAULT: 'text-base',
    sm: 'text-sm',
    small: 'text-sm',
    xs: 'text-xs',
  },
  button: {
    DEFAULT: 'text-sm font-medium',
    sm: 'text-xs font-medium',
    lg: 'text-base font-medium',
  },
  caption: 'text-xs text-gray-500 dark:text-gray-400',
  page: {
    title: 'text-3xl font-bold tracking-tight',
    description: 'text-base text-gray-600 dark:text-gray-400',
  },
  section: {
    title: 'text-2xl font-semibold',
    subtitle: 'text-lg font-medium',
  },
  component: {
    label: 'text-sm font-medium',
    input: 'text-base',
    help: 'text-xs text-gray-500',
  },
} as const

/**
 * spacingオブジェクト - globals.cssのCSS変数を参照
 */
export const spacing = {
  xs: '0.5rem',   // 8px - var(--spacing-xs)
  sm: '1rem',     // 16px - var(--spacing-sm)
  md: '1.5rem',   // 24px - var(--spacing-md)
  lg: '2rem',     // 32px - var(--spacing-lg)
  xl: '3rem',     // 48px - var(--spacing-xl)
  '2xl': '4rem',  // 64px - var(--spacing-2xl)
} as const

/**
 * roundedオブジェクト - globals.cssのCSS変数を参照
 */
export const rounded = {
  none: '0',
  sm: '0.25rem',   // 4px - var(--radius-sm)
  DEFAULT: '0.375rem', // 6px - var(--radius-md)
  md: '0.375rem',  // 6px - var(--radius-md)
  lg: '0.5rem',    // 8px - var(--radius-lg)
  xl: '0.75rem',   // 12px - var(--radius-xl)
  '2xl': '1rem',   // 16px - var(--radius-2xl)
  full: '9999px',  // var(--radius-full)
  component: {
    button: {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
    },
    card: 'rounded-lg',
    input: 'rounded-md',
    media: {
      avatar: 'rounded-full',
      image: 'rounded-lg',
    },
  },
} as const