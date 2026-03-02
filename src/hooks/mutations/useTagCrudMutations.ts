// タグCRUD用ミューテーションフック（作成・更新・削除・リネーム・色変更・並び替え）

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { DEFAULT_TAG_COLOR } from '@/lib/tag-colors';
import {
  generateTempId,
  replaceInPaginatedList,
  snapshotQuery,
  updatePaginatedList,
} from '@/lib/tanstack-query/optimistic-mutation';
import { trpc } from '@/lib/trpc/client';
import { useCalendarFilterStore } from '@/stores/useCalendarFilterStore';
import { useTagCacheStore } from '@/stores/useTagCacheStore';

import type { Tag } from '@/core/types/tag';

// 新しい入力型（tRPC形式）
interface TrpcTagUpdateInput {
  id: string;
  name?: string | undefined;
  color?: string | undefined;
}

export type UpdateTagInput = TrpcTagUpdateInput;

// タグ作成フック（楽観的更新付き）
export function useCreateTag() {
  const utils = trpc.useUtils();
  const t = useTranslations('tags');
  const incrementMutation = useTagCacheStore((state) => state.incrementMutation);
  const decrementMutation = useTagCacheStore((state) => state.decrementMutation);

  return trpc.tags.create.useMutation({
    onMutate: async (input) => {
      incrementMutation();

      const listSnapshot = await snapshotQuery(utils.tags.list);

      const tempId = generateTempId('tag');
      const tempTag: Tag = {
        id: tempId,
        name: input.name,
        color: input.color || DEFAULT_TAG_COLOR,
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

      useCalendarFilterStore.getState().initializeWithTags([tempId]);
      return { listSnapshot, tempId, tagName: input.name };
    },
    onSuccess: (result, _input, context) => {
      if (!context?.tempId) return;

      utils.tags.list.setData(undefined, (old) =>
        replaceInPaginatedList(old, 'id', context.tempId, result),
      );
      utils.tags.getById.setData({ id: result.id }, result);

      const filterStore = useCalendarFilterStore.getState();
      filterStore.removeTag(context.tempId);
      filterStore.initializeWithTags([result.id]);

      toast.success(t('toast.created', { name: result.name }));
    },
    onError: (_err, _input, context) => {
      context?.listSnapshot?.restore();
      if (context?.tempId) useCalendarFilterStore.getState().removeTag(context.tempId);
      toast.error(t('toast.createFailed'));
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

      const listSnapshot = await snapshotQuery(utils.tags.list);
      const detailSnapshot = await snapshotQuery(utils.tags.getById, { id: newData.id });

      const updateTag = (tag: Tag) => {
        if (tag.id !== newData.id) return tag;
        return {
          ...tag,
          name: newData.name ?? tag.name,
          color: newData.color ?? tag.color,
        };
      };

      utils.tags.list.setData(undefined, (old) => updatePaginatedList(old, updateTag));
      utils.tags.getById.setData({ id: newData.id }, (old) => (old ? updateTag(old) : undefined));

      return { listSnapshot, detailSnapshot };
    },
    onSuccess: (result) => {
      utils.tags.list.setData(undefined, (old) =>
        updatePaginatedList(old, (tag) => (tag.id === result.id ? result : tag)),
      );
      utils.tags.getById.setData({ id: result.id }, result);
    },
    onError: (err, _newData, context) => {
      context?.listSnapshot?.restore();
      context?.detailSnapshot?.restore();

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
      void utils.tags.getById.invalidate({ id: input.id });
    },
  });

  return {
    ...mutation,
    mutate: (input: UpdateTagInput) => {
      return mutation.mutate(input);
    },
    mutateAsync: async (input: UpdateTagInput) => {
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

      const listSnapshot = await snapshotQuery(utils.tags.list);
      const detailSnapshot = await snapshotQuery(utils.tags.getById, { id });

      utils.tags.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((tag) => tag.id !== id),
          count: old.count - 1,
        };
      });

      utils.tags.getById.setData({ id }, undefined);

      return { listSnapshot, detailSnapshot };
    },
    onError: (_err, _input, context) => {
      context?.listSnapshot?.restore();
      context?.detailSnapshot?.restore();
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
      void utils.plans.list.invalidate();
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

      const listSnapshot = await snapshotQuery(utils.tags.list);
      const detailSnapshot = await snapshotQuery(utils.tags.getById, { id: input.id });

      const updateName = (tag: Tag) =>
        tag.id === input.id ? { ...tag, name: input.name ?? tag.name } : tag;

      utils.tags.list.setData(undefined, (old) => updatePaginatedList(old, updateName));
      utils.tags.getById.setData({ id: input.id }, (old) => (old ? updateName(old) : undefined));

      return { listSnapshot, detailSnapshot };
    },
    onError: (err, _input, context) => {
      context?.listSnapshot?.restore();
      context?.detailSnapshot?.restore();

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

      const listSnapshot = await snapshotQuery(utils.tags.list);
      const detailSnapshot = await snapshotQuery(utils.tags.getById, { id: input.id });

      const updateColor = (tag: Tag) =>
        tag.id === input.id ? { ...tag, color: input.color ?? tag.color } : tag;

      utils.tags.list.setData(undefined, (old) => updatePaginatedList(old, updateColor));
      utils.tags.getById.setData({ id: input.id }, (old) => (old ? updateColor(old) : undefined));

      return { listSnapshot, detailSnapshot };
    },
    onError: (_err, _input, context) => {
      context?.listSnapshot?.restore();
      context?.detailSnapshot?.restore();
    },
    onSettled: (_data, _err, input) => {
      decrementMutation();
      void utils.tags.list.invalidate();
      void utils.tags.getById.invalidate({ id: input.id });
      void utils.plans.list.invalidate();
    },
  });
}

// タグ並び替え入力型
export interface ReorderTagInput {
  id: string;
  sort_order: number;
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

      const previousData = utils.tags.list.getData();

      utils.tags.list.setData(undefined, (oldData) => {
        if (!oldData) return oldData;

        const newData = oldData.data.map((tag) => {
          const update = updates.find((u) => u.id === tag.id);
          if (update) {
            return { ...tag, sort_order: update.sort_order };
          }
          return tag;
        });

        return { ...oldData, data: [...newData] };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) utils.tags.list.setData(undefined, context.previousData);
    },
    onSettled: () => {
      decrementMutation();
    },
  });
}
