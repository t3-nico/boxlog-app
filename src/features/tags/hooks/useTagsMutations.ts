// タグ変更用ミューテーションフック（リエクスポート）
//
// 実装は以下のファイルに分割:
// - useTagCrudMutations.ts: CRUD mutations（作成・更新・削除・移動・リネーム・色変更・並び替え）
// - useTagMergeMutation.ts: マージmutation

export {
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useRenameTag,
  useReorderTags,
  useUpdateTag,
  useUpdateTagColor,
} from './useTagCrudMutations';

export type { ReorderTagInput } from './useTagCrudMutations';

export { useMergeTag } from './useTagMergeMutation';
