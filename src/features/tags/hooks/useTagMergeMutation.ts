// タグマージ用ミューテーションフック（楽観的更新付き）

import { trpc } from '@/lib/trpc/client';

import { useTagCacheStore } from '../stores/useTagCacheStore';

export function useMergeTag() {
  const utils = trpc.useUtils();
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.merge.useMutation({
    onMutate: async ({ sourceTagId, targetTagId }) => {
      incrementMutation();

      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();
      await utils.tags.getById.cancel({ id: sourceTagId });
      await utils.tags.getById.cancel({ id: targetTagId });
      await utils.plans.getTagStats.cancel();
      await utils.plans.list.cancel();

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();
      const previousSourceDetail = utils.tags.getById.getData({ id: sourceTagId });
      const previousTargetDetail = utils.tags.getById.getData({ id: targetTagId });

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data
            .filter((tag) => tag.id !== sourceTagId)
            .map((tag) => (tag.parent_id === sourceTagId ? { ...tag, parent_id: null } : tag)),
          count: old.count - 1,
        };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.filter((tag) => tag.id !== sourceTagId) };
      });

      utils.tags.getById.setData({ id: sourceTagId }, undefined);

      return {
        previousData,
        previousParentTags,
        previousSourceDetail,
        previousTargetDetail,
        sourceTagId,
        targetTagId,
      };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.previousSourceDetail && context?.sourceTagId) {
        utils.tags.getById.setData({ id: context.sourceTagId }, context.previousSourceDetail);
      }
      if (context?.previousTargetDetail && context?.targetTagId) {
        utils.tags.getById.setData({ id: context.targetTagId }, context.previousTargetDetail);
      }
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      void utils.tags.getById.invalidate({ id: input.sourceTagId });
      void utils.tags.getById.invalidate({ id: input.targetTagId });
      void utils.plans.list.invalidate();
      void utils.plans.getTagStats.refetch();
    },
  });
}
