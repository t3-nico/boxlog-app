/**
 * タグ機能用のカラー定数
 */

// タグ用のプリセットカラー（ユーザーがタグ作成時に選択できる色）
export const TAG_PRESET_COLORS = [
  'rgb(59 130 246)', // Blue #3B82F6
  'rgb(16 185 129)', // Emerald #10B981
  'rgb(245 158 11)', // Amber #F59E0B
  'rgb(239 68 68)', // Red #EF4444
  'rgb(139 92 246)', // Violet #8B5CF6
  'rgb(6 182 212)', // Cyan #06B6D4
  'rgb(132 204 22)', // Lime #84CC16
  'rgb(249 115 22)', // Orange #F97316
  'rgb(236 72 153)', // Pink #EC4899
  'rgb(107 114 128)', // Gray #6B7280
] as const

// タグカラーパレット（フル）
export const TAG_COLOR_PALETTE = [
  ['rgb(239 68 68)', 'rgb(249 115 22)', 'rgb(245 158 11)', 'rgb(234 179 8)'],
  ['rgb(132 204 22)', 'rgb(34 197 94)', 'rgb(16 185 129)', 'rgb(20 184 166)'],
  ['rgb(6 182 212)', 'rgb(14 165 233)', 'rgb(59 130 246)', 'rgb(99 102 241)'],
  ['rgb(139 92 246)', 'rgb(168 85 247)', 'rgb(217 70 239)', 'rgb(236 72 153)'],
] as const

// デフォルト値（フォールバック用）
export const DEFAULT_TAG_COLOR = 'rgb(59 130 246)'

// ヘルパー関数
export function getTagPresetColor(index: number): string {
  return TAG_PRESET_COLORS[index % TAG_PRESET_COLORS.length]
}

// 型定義
export type TagPresetColor = (typeof TAG_PRESET_COLORS)[number]
