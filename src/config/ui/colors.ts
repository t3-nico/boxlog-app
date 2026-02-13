/**
 * タグカラー定義
 *
 * HEX値とCSS変数名のマッピング
 * globals.css の --tag-* トークンと対応
 */
export const TAG_COLORS = {
  blue: { hex: '#3B82F6', cssVar: 'var(--tag-blue)', tailwind: 'bg-tag-blue' },
  green: { hex: '#10B981', cssVar: 'var(--tag-green)', tailwind: 'bg-tag-green' },
  red: { hex: '#EF4444', cssVar: 'var(--tag-red)', tailwind: 'bg-tag-red' },
  amber: { hex: '#F59E0B', cssVar: 'var(--tag-amber)', tailwind: 'bg-tag-amber' },
  violet: { hex: '#8B5CF6', cssVar: 'var(--tag-violet)', tailwind: 'bg-tag-violet' },
  pink: { hex: '#EC4899', cssVar: 'var(--tag-pink)', tailwind: 'bg-tag-pink' },
  cyan: { hex: '#06B6D4', cssVar: 'var(--tag-cyan)', tailwind: 'bg-tag-cyan' },
  orange: { hex: '#F97316', cssVar: 'var(--tag-orange)', tailwind: 'bg-tag-orange' },
  gray: { hex: '#6B7280', cssVar: 'var(--tag-gray)', tailwind: 'bg-tag-gray' },
  indigo: { hex: '#6366F1', cssVar: 'var(--tag-indigo)', tailwind: 'bg-tag-indigo' },
} as const;

export type TagColorName = keyof typeof TAG_COLORS;

/**
 * タグ・グループ用カラーパレット（HEX値配列）
 *
 * 後方互換性のため維持
 * 新規実装では TAG_COLORS を推奨
 */
export const TAG_COLOR_PALETTE = Object.values(TAG_COLORS).map((c) => c.hex);

/**
 * HEX値からCSS変数を取得
 */
export function getTagCssVar(hex: string): string | undefined {
  const color = Object.values(TAG_COLORS).find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  return color?.cssVar;
}

/**
 * HEX値からTailwindクラスを取得
 */
export function getTagTailwindClass(hex: string): string | undefined {
  const color = Object.values(TAG_COLORS).find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  return color?.tailwind;
}

/**
 * デフォルトタグカラー
 */
export const DEFAULT_TAG_COLOR = TAG_COLORS.blue.hex;

/**
 * デフォルトグループカラー
 */
export const DEFAULT_GROUP_COLOR = TAG_COLORS.gray.hex;
