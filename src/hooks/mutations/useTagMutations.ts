/**
 * Tag mutation hooks - Shared layer implementations
 *
 * features間のimport禁止ルールに対応するため、shared hooksとして公開
 */
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
