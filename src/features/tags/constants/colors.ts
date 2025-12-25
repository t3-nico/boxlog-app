/**
 * タグ機能用の定数
 */

// ========================================
// 文字数制限
// ========================================

/** タグ名の最大文字数 */
export const TAG_NAME_MAX_LENGTH = 30;

/** タグの説明の最大文字数 */
export const TAG_DESCRIPTION_MAX_LENGTH = 100;

/** グループ名の最大文字数 */
export const TAG_GROUP_NAME_MAX_LENGTH = 30;

// ========================================
// カラー定数（config/ui/colors.ts から再エクスポート）
// ========================================

export { DEFAULT_GROUP_COLOR, DEFAULT_TAG_COLOR, TAG_COLOR_PALETTE } from '@/config/ui/colors';

/**
 * @deprecated TAG_PRESET_COLORS は TAG_COLOR_PALETTE に統一されました
 * 互換性のため TAG_COLOR_PALETTE を再エクスポート
 */
export { TAG_COLOR_PALETTE as TAG_PRESET_COLORS } from '@/config/ui/colors';
