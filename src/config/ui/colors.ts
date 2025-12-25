/**
 * タグ・グループ用カラーパレット
 *
 * プロジェクト全体で使用される10色のカラーパレット
 * タグとグループのカラー選択で統一して使用する
 */
export const TAG_COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6B7280', // Gray
  '#6366F1', // Indigo
] as const;

/**
 * デフォルトタグカラー
 */
export const DEFAULT_TAG_COLOR = TAG_COLOR_PALETTE[0]; // Blue

/**
 * デフォルトグループカラー
 */
export const DEFAULT_GROUP_COLOR = '#6B7280'; // Gray
