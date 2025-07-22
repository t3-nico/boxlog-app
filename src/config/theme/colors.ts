/**
 * テーマカラー定義
 * 
 * アプリケーション全体で使用する色の定義
 * Tailwind CSSのデフォルトカラーパレットに基づく
 */

// ブランドカラー
export const BRAND_COLORS = {
  primary: 'rgb(var(--color-primary) / <alpha-value>)',
  secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
  accent: 'rgb(var(--color-accent) / <alpha-value>)',
} as const

// セマンティックカラー（用途別）
export const SEMANTIC_COLORS = {
  success: 'rgb(var(--color-success) / <alpha-value>)',
  warning: 'rgb(var(--color-warning) / <alpha-value>)',
  error: 'rgb(var(--color-error) / <alpha-value>)',
  info: 'rgb(var(--color-info) / <alpha-value>)',
} as const

// タグ用のプリセットカラー
export const TAG_PRESET_COLORS = [
  'var(--color-tag-blue)',      // Blue #3B82F6
  'var(--color-tag-emerald)',   // Emerald #10B981
  'var(--color-tag-amber)',     // Amber #F59E0B
  'var(--color-tag-red)',       // Red #EF4444
  'var(--color-tag-violet)',    // Violet #8B5CF6
  'var(--color-tag-cyan)',      // Cyan #06B6D4
  'var(--color-tag-lime)',      // Lime #84CC16
  'var(--color-tag-orange)',    // Orange #F97316
  'var(--color-tag-pink)',      // Pink #EC4899
  'var(--color-tag-gray)',      // Gray #6B7280
] as const

// タグカラーパレット（フル）
export const TAG_COLOR_PALETTE = [
  ['var(--color-tag-red)', 'var(--color-tag-orange)', 'var(--color-tag-amber)', 'var(--color-tag-yellow)'],
  ['var(--color-tag-lime)', 'var(--color-tag-green)', 'var(--color-tag-emerald)', 'var(--color-tag-teal)'],
  ['var(--color-tag-cyan)', 'var(--color-tag-sky)', 'var(--color-tag-blue)', 'var(--color-tag-indigo)'],
  ['var(--color-tag-violet)', 'var(--color-tag-purple)', 'var(--color-tag-fuchsia)', 'var(--color-tag-pink)'],
] as const

// クロノタイプ用カラー
export const CHRONOTYPE_COLORS = {
  morning: 'var(--color-chronotype-morning)',    // Morning person - Blue
  evening: 'var(--color-chronotype-evening)',    // Evening person - Purple
  balanced: 'var(--color-chronotype-balanced)',  // Balanced - Green
} as const

// タスクステータスカラー
export const TASK_STATUS_COLORS = {
  todo: 'var(--color-task-todo)',           // Gray
  inProgress: 'var(--color-task-progress)', // Blue
  completed: 'var(--color-task-completed)', // Green
  cancelled: 'var(--color-task-cancelled)', // Red
} as const

// タスク優先度カラー
export const TASK_PRIORITY_COLORS = {
  high: 'var(--color-priority-high)',      // Red
  medium: 'var(--color-priority-medium)',  // Yellow
  low: 'var(--color-priority-low)',        // Green
} as const

// デフォルト値（フォールバック用）
export const DEFAULT_TAG_COLOR = 'var(--color-tag-blue)'
export const DEFAULT_BRAND_COLOR = 'var(--color-primary)'

// ヘルパー関数
export function getTagPresetColor(index: number): string {
  return TAG_PRESET_COLORS[index % TAG_PRESET_COLORS.length]
}

export function getCSSVariableValue(cssVar: string): string {
  if (typeof window === 'undefined') return cssVar
  
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar.replace('var(', '').replace(')', ''))
    .trim()
  
  return value || cssVar
}

// 型定義
export type TagPresetColor = typeof TAG_PRESET_COLORS[number]
export type ChronotypeColor = keyof typeof CHRONOTYPE_COLORS
export type TaskStatusColor = keyof typeof TASK_STATUS_COLORS
export type TaskPriorityColor = keyof typeof TASK_PRIORITY_COLORS