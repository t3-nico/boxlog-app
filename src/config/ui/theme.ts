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