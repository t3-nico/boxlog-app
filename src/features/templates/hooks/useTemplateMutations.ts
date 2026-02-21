// テンプレート変更用ミューテーションフック（楽観的更新付き）

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  generateTempId,
  removeFromPaginatedList,
  replaceInPaginatedList,
  snapshotQuery,
  updatePaginatedList,
} from '@/lib/tanstack-query/optimistic-mutation';
import { trpc } from '@/lib/trpc/client';

import type { PlanTemplate } from '@/features/templates/types';

// テンプレート作成フック（楽観的更新付き）
export function useCreateTemplate() {
  const utils = trpc.useUtils();
  const t = useTranslations('templates');

  return trpc.templates.create.useMutation({
    onMutate: async (input) => {
      // スナップショット作成
      const listSnapshot = await snapshotQuery(utils.templates.list);

      // 一時テンプレートを作成
      const tempId = generateTempId('template');
      const tempTemplate: PlanTemplate = {
        id: tempId,
        user_id: '',
        name: input.name,
        description: input.description ?? null,
        title_pattern: input.title_pattern,
        plan_description: input.plan_description ?? null,
        duration_minutes: input.duration_minutes ?? null,
        reminder_minutes: input.reminder_minutes ?? null,
        use_count: 0,
        tag_ids: input.tag_ids ?? [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 楽観的更新（list）- 先頭に追加
      utils.templates.list.setData(undefined, (old) => {
        if (!old) return { data: [tempTemplate], count: 1 };
        return { ...old, data: [tempTemplate, ...old.data], count: old.count + 1 };
      });

      return { listSnapshot, tempId };
    },
    onSuccess: (result, _input, context) => {
      if (!context?.tempId) return;

      // 一時テンプレートを実際のテンプレートに置換
      utils.templates.list.setData(undefined, (old) =>
        replaceInPaginatedList(old, 'id', context.tempId, result),
      );
      utils.templates.getById.setData({ id: result.id }, result);

      toast.success(t('toast.created', { name: result.name }));
    },
    onError: (_err, _input, context) => {
      // ロールバック
      context?.listSnapshot?.restore();
      toast.error(t('toast.createFailed'));
    },
    onSettled: () => {
      void utils.templates.list.invalidate();
    },
  });
}

// テンプレート更新フック（楽観的更新付き）
export function useUpdateTemplate() {
  const utils = trpc.useUtils();
  const t = useTranslations('templates');

  return trpc.templates.update.useMutation({
    onMutate: async (newData) => {
      // スナップショット作成
      const listSnapshot = await snapshotQuery(utils.templates.list);
      const detailSnapshot = await snapshotQuery(utils.templates.getById, { id: newData.id });

      // 楽観的更新
      const updateTemplate = (template: PlanTemplate) => {
        if (template.id !== newData.id) return template;
        return {
          ...template,
          ...(newData.name !== undefined && { name: newData.name }),
          ...(newData.description !== undefined && { description: newData.description }),
          ...(newData.title_pattern !== undefined && { title_pattern: newData.title_pattern }),
          ...(newData.plan_description !== undefined && {
            plan_description: newData.plan_description,
          }),
          ...(newData.duration_minutes !== undefined && {
            duration_minutes: newData.duration_minutes,
          }),
          ...(newData.reminder_minutes !== undefined && {
            reminder_minutes: newData.reminder_minutes,
          }),
          ...(newData.tag_ids !== undefined && { tag_ids: newData.tag_ids }),
        };
      };

      utils.templates.list.setData(undefined, (old) => updatePaginatedList(old, updateTemplate));
      utils.templates.getById.setData({ id: newData.id }, (old) =>
        old ? updateTemplate(old) : undefined,
      );

      return { listSnapshot, detailSnapshot };
    },
    onSuccess: (result) => {
      // サーバーレスポンスでキャッシュを更新
      utils.templates.list.setData(undefined, (old) =>
        updatePaginatedList(old, (template) => (template.id === result.id ? result : template)),
      );
      utils.templates.getById.setData({ id: result.id }, result);
      toast.success(t('toast.updated', { name: result.name }));
    },
    onError: (_err, _input, context) => {
      // ロールバック
      context?.listSnapshot?.restore();
      context?.detailSnapshot?.restore();
      toast.error(t('toast.updateFailed'));
    },
    onSettled: (_data, _err, input) => {
      void utils.templates.list.invalidate();
      void utils.templates.getById.invalidate({ id: input.id });
    },
  });
}

// テンプレート削除フック（楽観的更新付き）
export function useDeleteTemplate() {
  const utils = trpc.useUtils();
  const t = useTranslations('templates');

  return trpc.templates.delete.useMutation({
    onMutate: async ({ id }) => {
      // スナップショット作成
      const listSnapshot = await snapshotQuery(utils.templates.list);
      const detailSnapshot = await snapshotQuery(utils.templates.getById, { id });

      // 楽観的更新（list） - 削除
      utils.templates.list.setData(undefined, (old) => removeFromPaginatedList(old, 'id', id));

      // 楽観的更新（detail）
      utils.templates.getById.setData({ id }, undefined);

      return { listSnapshot, detailSnapshot };
    },
    onError: (_err, _input, context) => {
      // ロールバック
      context?.listSnapshot?.restore();
      context?.detailSnapshot?.restore();
      toast.error(t('toast.deleteFailed'));
    },
    onSettled: (_data, _err, input) => {
      void utils.templates.list.invalidate();
      void utils.templates.getById.invalidate({ id: input.id });
    },
  });
}

// 使用回数インクリメントフック
export function useIncrementTemplateUseCount() {
  const utils = trpc.useUtils();

  return trpc.templates.incrementUseCount.useMutation({
    onMutate: async ({ id }) => {
      const listSnapshot = await snapshotQuery(utils.templates.list);

      // 楽観的更新: use_count を +1
      utils.templates.list.setData(undefined, (old) =>
        updatePaginatedList(old, (template) =>
          template.id === id ? { ...template, use_count: template.use_count + 1 } : template,
        ),
      );

      return { listSnapshot };
    },
    onError: (_err, _input, context) => {
      context?.listSnapshot?.restore();
    },
    onSettled: () => {
      void utils.templates.list.invalidate();
    },
  });
}
