/**
 * タグ機能用の定数
 */

// ========================================
// 文字数制限
// ========================================

/** タグ名の最大文字数（バックエンドと一致: z.string().max(50)） */
export const TAG_NAME_MAX_LENGTH = 50;

/** タグの説明の最大文字数 */
export const TAG_DESCRIPTION_MAX_LENGTH = 100;

/** グループ名の最大文字数（タグ名と同じ） */
export const TAG_GROUP_NAME_MAX_LENGTH = 50;

// ========================================
// カラー定数（config/ui/colors.ts から再エクスポート）
// ========================================

export { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR, TAG_COLOR_PALETTE } from '@/config/ui/colors';
