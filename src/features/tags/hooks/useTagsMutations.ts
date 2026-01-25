// タグ変更用ミューテーションフック（楽観的更新付き）

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { trpc } from '@/lib/trpc/client';

import { DEFAULT_TAG_COLOR } from '@/features/tags/constants/colors';
import type { Tag } from '@/features/tags/types';
import { useTagCacheStore } from '../stores/useTagCacheStore';

// カレンダーフィルターストアへの参照（楽観的更新用）
import { useCalendarFilterStore } from '@/features/calendar/stores/useCalendarFilterStore';

// 後方互換性のための入力型
interface LegacyTagUpdateInput {
  id: string;
  data: {
    name?: string | undefined;
    color?: string | undefined;
    description?: string | null | undefined;
    icon?: string | null | undefined;
    is_active?: boolean | undefined;
    parentId?: string | null | undefined;
    /** @deprecated use parentId instead */
    group_id?: string | null | undefined;
    /** @deprecated use parentId instead */
    groupId?: string | null | undefined;
    sort_order?: number | undefined;
  };
}

// 新しい入力型（tRPC形式）
interface TrpcTagUpdateInput {
  id: string;
  name?: string | undefined;
  color?: string | undefined;
  description?: string | null | undefined;
  parentId?: string | null | undefined;
  /** @deprecated use parentId instead */
  groupId?: string | null | undefined;
}

type UpdateTagInput = LegacyTagUpdateInput | TrpcTagUpdateInput;

function isLegacyTagInput(input: UpdateTagInput): input is LegacyTagUpdateInput {
  return 'data' in input;
}

// タグ作成フック（楽観的更新付き）
export function useCreateTag() {
  const utils = trpc.useUtils();
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.create.useMutation({
    onMutate: async (input) => {
      incrementMutation();
      void utils.tags.list.cancel();
      void utils.tags.listParentTags.cancel();

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      const tempId = `temp-${Date.now()}`;
      const tempTag: Tag = {
        id: tempId,
        name: input.name,
        color: input.color || DEFAULT_TAG_COLOR,
        description: input.description ?? null,
        icon: null,
        parent_id: input.parentId ?? null,
        sort_order: 0,
        is_active: true,
        user_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return { data: [tempTag], count: 1 };
        return { ...old, data: [tempTag, ...old.data], count: old.count + 1 };
      });

      if (!input.parentId) {
        utils.tags.listParentTags.setData(undefined, (old) => {
          if (!old) return { data: [tempTag], count: 1 };
          return {
            ...old,
            data: [tempTag, ...old.data],
            count: (old.count ?? old.data.length) + 1,
          };
        });
      }

      useCalendarFilterStore.getState().initializeWithTags([tempId]);
      return { previousData, previousParentTags, tempId, tagName: input.name };
    },
    onSuccess: (result, _input, context) => {
      if (!context?.tempId) return;

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((tag) => (tag.id === context.tempId ? result : tag)) };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((tag) => (tag.id === context.tempId ? result : tag)) };
      });

      utils.tags.getById.setData({ id: result.id }, result);

      const filterStore = useCalendarFilterStore.getState();
      filterStore.removeTag(context.tempId);
      filterStore.initializeWithTags([result.id]);

      toast.success(`タグ「${result.name}」を作成しました`);
    },
    onError: (_err, _input, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.tempId) useCalendarFilterStore.getState().removeTag(context.tempId);
      toast.error('タグの作成に失敗しました');
    },
    onSettled: () => {
      decrementMutation();
    },
  });
}

// タグ更新フック（楽観的更新付き）
export function useUpdateTag() {
  const utils = trpc.useUtils();
  const t = useTranslations('tags');
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  const mutation = trpc.tags.update.useMutation({
    onMutate: async (newData) => {
      incrementMutation();

      await Promise.all([
        utils.tags.list.cancel(),
        utils.tags.listParentTags.cancel(),
        utils.tags.getById.cancel({ id: newData.id }),
      ]);

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();
      const previousDetail = utils.tags.getById.getData({ id: newData.id });

      const updateTag = (tag: Tag) => {
        if (tag.id !== newData.id) return tag;
        return {
          ...tag,
          name: newData.name ?? tag.name,
          color: newData.color ?? tag.color,
          description: newData.description !== undefined ? newData.description : tag.description,
          parent_id: newData.parentId !== undefined ? newData.parentId : tag.parent_id,
        };
      };

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map(updateTag) };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map(updateTag) };
      });

      utils.tags.getById.setData({ id: newData.id }, (old) => (old ? updateTag(old) : undefined));

      return { previousData, previousParentTags, previousDetail };
    },
    onSuccess: (result) => {
      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((tag) => (tag.id === result.id ? result : tag)) };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((tag) => (tag.id === result.id ? result : tag)) };
      });

      utils.tags.getById.setData({ id: result.id }, result);
    },
    onError: (err, newData, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.previousDetail)
        utils.tags.getById.setData({ id: newData.id }, context.previousDetail);

      const message = err.message;
      if (message.includes('already exists') || message.includes('DUPLICATE_NAME')) {
        toast.error(t('errors.duplicateName'));
      } else {
        toast.error(t('errors.updateFailed'));
      }
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.plans.list.invalidate();
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
    },
  });

  return {
    ...mutation,
    mutate: (input: UpdateTagInput) => {
      if (isLegacyTagInput(input)) {
        const parentId =
          input.data.parentId !== undefined
            ? input.data.parentId
            : input.data.groupId !== undefined
              ? input.data.groupId
              : input.data.group_id;
        return mutation.mutate({
          id: input.id,
          name: input.data.name,
          color: input.data.color,
          description: input.data.description,
          parentId,
        });
      }
      return mutation.mutate(input);
    },
    mutateAsync: async (input: UpdateTagInput) => {
      if (isLegacyTagInput(input)) {
        const parentId =
          input.data.parentId !== undefined
            ? input.data.parentId
            : input.data.groupId !== undefined
              ? input.data.groupId
              : input.data.group_id;
        return mutation.mutateAsync({
          id: input.id,
          name: input.data.name,
          color: input.data.color,
          description: input.data.description,
          parentId,
        });
      }
      return mutation.mutateAsync(input);
    },
  };
}

// タグ削除フック（楽観的更新付き）
export function useDeleteTag() {
  const utils = trpc.useUtils();
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.delete.useMutation({
    onMutate: async ({ id }) => {
      incrementMutation();

      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();
      await utils.tags.getById.cancel({ id });

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();
      const previousDetail = utils.tags.getById.getData({ id });

      const deletedTag = previousData?.data.find((tag) => tag.id === id);
      const childTags = previousData?.data.filter((tag) => tag.parent_id === id) ?? [];

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data
            .filter((tag) => tag.id !== id)
            .map((tag) => (tag.parent_id === id ? { ...tag, parent_id: null } : tag)),
          count: old.count - 1,
        };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        const filteredData = old.data.filter((tag) => tag.id !== id);
        const promotedChildren = childTags.map((tag) => ({ ...tag, parent_id: null }));
        return { ...old, data: [...filteredData, ...promotedChildren] };
      });

      utils.tags.getById.setData({ id }, undefined);

      return { previousData, previousParentTags, previousDetail, deletedTag };
    },
    onError: (_err, input, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.previousDetail)
        utils.tags.getById.setData({ id: input.id }, context.previousDetail);
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
      void utils.plans.list.invalidate();
    },
  });
}

// タググループ移動フック（楽観的更新付き）
export function useMoveTag() {
  const utils = trpc.useUtils();
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.update.useMutation({
    onMutate: async (input) => {
      incrementMutation();

      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();
      await utils.tags.getById.cancel({ id: input.id });

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();
      const previousDetail = utils.tags.getById.getData({ id: input.id });

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) =>
            tag.id === input.id ? { ...tag, parent_id: input.parentId ?? tag.parent_id } : tag,
          ),
        };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        const movedTag = previousData?.data.find((t) => t.id === input.id);
        if (!movedTag) return old;

        if (input.parentId === null) {
          const exists = old.data.some((t) => t.id === input.id);
          if (!exists) {
            return { ...old, data: [...old.data, { ...movedTag, parent_id: null }] };
          }
        } else {
          return { ...old, data: old.data.filter((t) => t.id !== input.id) };
        }
        return old;
      });

      utils.tags.getById.setData({ id: input.id }, (old) =>
        old ? { ...old, parent_id: input.parentId ?? old.parent_id } : undefined,
      );

      return { previousData, previousParentTags, previousDetail };
    },
    onError: (_err, input, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.previousDetail)
        utils.tags.getById.setData({ id: input.id }, context.previousDetail);
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
    },
  });
}

// タグリネームフック（楽観的更新付き）
export function useRenameTag() {
  const utils = trpc.useUtils();
  const t = useTranslations('tags');
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.update.useMutation({
    onMutate: async (input) => {
      incrementMutation();

      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();
      await utils.tags.getById.cancel({ id: input.id });

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();
      const previousDetail = utils.tags.getById.getData({ id: input.id });

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) =>
            tag.id === input.id ? { ...tag, name: input.name ?? tag.name } : tag,
          ),
        };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) =>
            tag.id === input.id ? { ...tag, name: input.name ?? tag.name } : tag,
          ),
        };
      });

      utils.tags.getById.setData({ id: input.id }, (old) =>
        old ? { ...old, name: input.name ?? old.name } : undefined,
      );

      return { previousData, previousParentTags, previousDetail };
    },
    onError: (err, input, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.previousDetail)
        utils.tags.getById.setData({ id: input.id }, context.previousDetail);

      const message = err.message;
      if (message.includes('already exists') || message.includes('DUPLICATE_NAME')) {
        toast.error(t('errors.duplicateName'));
      } else {
        toast.error(t('errors.updateFailed'));
      }
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
      void utils.plans.list.invalidate();
    },
  });
}

// タグ色変更フック（楽観的更新付き）
export function useUpdateTagColor() {
  const utils = trpc.useUtils();
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.update.useMutation({
    onMutate: async (input) => {
      incrementMutation();

      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();
      await utils.tags.getById.cancel({ id: input.id });

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();
      const previousDetail = utils.tags.getById.getData({ id: input.id });

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) =>
            tag.id === input.id ? { ...tag, color: input.color ?? tag.color } : tag,
          ),
        };
      });

      utils.tags.listParentTags.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((tag) =>
            tag.id === input.id ? { ...tag, color: input.color ?? tag.color } : tag,
          ),
        };
      });

      utils.tags.getById.setData({ id: input.id }, (old) =>
        old ? { ...old, color: input.color ?? old.color } : undefined,
      );

      return { previousData, previousParentTags, previousDetail };
    },
    onError: (_err, input, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
      if (context?.previousDetail)
        utils.tags.getById.setData({ id: input.id }, context.previousDetail);
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.listParentTags.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
      void utils.plans.list.invalidate();
    },
  });
}

// タグマージフック（楽観的更新付き）
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

// タグ並び替え入力型
export interface ReorderTagInput {
  id: string;
  sort_order: number;
  parent_id: string | null;
}

// タグ並び替えフック（楽観的更新付き）
export function useReorderTags() {
  const utils = trpc.useUtils();
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.reorder.useMutation({
    onMutate: async ({ updates }) => {
      incrementMutation();

      await utils.tags.list.cancel();
      await utils.tags.listParentTags.cancel();

      const previousData = utils.tags.list.getData();
      const previousParentTags = utils.tags.listParentTags.getData();

      utils.tags.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;

        const newData = oldData.data.map((tag) => {
          const update = updates.find((u) => u.id === tag.id);
          if (update) {
            return { ...tag, sort_order: update.sort_order, parent_id: update.parent_id };
          }
          return tag;
        });

        return { ...oldData, data: [...newData] };
      });

      const allTags = previousData?.data ?? [];
      utils.tags.listParentTags.setData(undefined, (oldData) => {
        if (!oldData) return oldData;

        let newData = oldData.data.map((tag) => {
          const update = updates.find((u) => u.id === tag.id);
          if (update) {
            return { ...tag, sort_order: update.sort_order, parent_id: update.parent_id };
          }
          return tag;
        });

        const promotedToRoot = updates.filter(
          (u) => u.parent_id === null && !oldData.data.some((t) => t.id === u.id),
        );
        for (const promoted of promotedToRoot) {
          const fullTag = allTags.find((t) => t.id === promoted.id);
          if (fullTag) {
            newData.push({ ...fullTag, sort_order: promoted.sort_order, parent_id: null });
          }
        }

        const demotedFromRoot = updates.filter((u) => u.parent_id !== null);
        newData = newData.filter((tag) => !demotedFromRoot.some((d) => d.id === tag.id));

        newData.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        return { ...oldData, data: [...newData] };
      });

      return { previousData, previousParentTags };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
      if (context?.previousParentTags)
        utils.tags.listParentTags.setData(undefined, context.previousParentTags);
    },
    onSettled: () => {
      decrementMutation();
    },
  });
}
