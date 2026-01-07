/**
 * タグ型定義の再エクスポート
 *
 * 実際の定義は src/features/tags/types にあります。
 * 後方互換性のためにここから再エクスポートしています。
 */

export type {
  CreateTagInput,
  Tag,
  TagGroup,
  TagOption,
  TagWithChildren,
  UpdateTagInput,
} from '@/features/tags/types';
