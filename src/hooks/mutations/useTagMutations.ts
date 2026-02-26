/**
 * Tag mutation hooks - Re-export from feature for cross-feature usage
 *
 * 実体は @/features/tags/hooks/useTagCrudMutations に存在
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
} from '@/features/tags/hooks/useTagCrudMutations';

export type { ReorderTagInput } from '@/features/tags/hooks/useTagCrudMutations';

export { useMergeTag } from '@/features/tags/hooks/useTagMergeMutation';
