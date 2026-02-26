/**
 * Re-export from shared hooks for backward compatibility
 * 実体は @/hooks/mutations/useTagCrudMutations に移動済み
 */
export {
  useCreateTag,
  useDeleteTag,
  useMoveTag,
  useRenameTag,
  useReorderTags,
  useUpdateTag,
  useUpdateTagColor,
} from '@/hooks/mutations/useTagCrudMutations';

export type { ReorderTagInput, UpdateTagInput } from '@/hooks/mutations/useTagCrudMutations';
