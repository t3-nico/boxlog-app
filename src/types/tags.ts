/**
 * タグ型定義の再エクスポート
 *
 * 実際の定義は src/core/types/tag にあります。
 * 後方互換性のためにここから再エクスポートしています。
 */

export type {
  CreateTagInput,
  Tag,
  TagOption,
  TagWithChildren,
  UpdateTagInput,
} from '@/core/types/tag';
