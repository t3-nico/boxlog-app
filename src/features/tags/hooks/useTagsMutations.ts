// タグ変更用ミューテーションフック（リエクスポート）
//
// 実装は以下のファイルに分割:
// - useTagCrudMutations.ts: CRUD mutations（作成・更新・削除・リネーム・色変更・並び替え）
// - @/hooks/mutations/useTagMergeMutation.ts: マージmutation

export {
  useCreateTag,
  useDeleteTag,
  useRenameTag,
  useReorderTags,
  useUpdateTag,
  useUpdateTagColor,
} from './useTagCrudMutations';

export type { ReorderTagInput } from './useTagCrudMutations';

export { useMergeTag } from '@/hooks/mutations/useTagMergeMutation';
