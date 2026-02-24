/**
 * Record Mutations フック
 *
 * Record操作のCRUDメソッドを提供
 * 楽観的更新でUIを即座に反映
 */

import { createTempId, invalidateEntityCaches } from '@/hooks/mutations/mutationUtils';
import { api } from '@/lib/trpc';

import type { CreateRecordInput, UpdateRecordInput } from '@/schemas/records';
import type { RecordItem } from './useRecordData';

/**
 * Record操作のmutationsを提供するフック
 */
export function useRecordMutations() {
  const utils = api.useUtils();

  // Record作成
  const createRecord = api.records.create.useMutation({
    onMutate: async (input) => {
      await utils.records.list.cancel();
      const previous = utils.records.list.getData();

      // 楽観的更新: 一時的なIDで追加
      utils.records.list.setData({}, (old) => {
        if (!old) return old;
        const tempRecord: RecordItem = {
          id: createTempId(),
          user_id: '',
          plan_id: input.plan_id ?? null,
          title: input.title ?? null,
          worked_at: input.worked_at,
          start_time: input.start_time ?? null,
          end_time: input.end_time ?? null,
          duration_minutes: input.duration_minutes,
          fulfillment_score: input.fulfillment_score ?? null,
          description: input.description ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tagIds: input.tagIds ?? [],
        };
        return [tempRecord, ...old];
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.records.list.setData({}, context.previous);
      }
      // TIME_OVERLAPエラーはモーダル内でエラー表示（toastなし）
    },
    onSettled: () => {
      void invalidateEntityCaches(utils, 'records');
    },
  });

  // Record更新
  const updateRecord = api.records.update.useMutation({
    onMutate: async ({ id, data }) => {
      await utils.records.list.cancel();
      const previous = utils.records.list.getData();

      utils.records.list.setData({}, (old) => {
        if (!old) return old;
        return old.map((record) => {
          if (record.id !== id) return record;
          // 明示的に各フィールドを更新（undefined を防ぐ）
          return {
            ...record,
            title: data.title !== undefined ? data.title : (record.title ?? null),
            worked_at: data.worked_at ?? record.worked_at,
            start_time: data.start_time !== undefined ? data.start_time : record.start_time,
            end_time: data.end_time !== undefined ? data.end_time : record.end_time,
            duration_minutes: data.duration_minutes ?? record.duration_minutes,
            fulfillment_score:
              data.fulfillment_score !== undefined
                ? data.fulfillment_score
                : record.fulfillment_score,
            description: data.description !== undefined ? data.description : record.description,
            updated_at: new Date().toISOString(),
            tagIds: record.tagIds, // 明示的に保持
          };
        });
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.records.list.setData({}, context.previous);
      }
    },
    onSettled: (_data, _error, { id }) => {
      void invalidateEntityCaches(utils, 'records', { entityId: id });
    },
  });

  // Record削除
  const deleteRecord = api.records.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.records.list.cancel();
      const previous = utils.records.list.getData();

      utils.records.list.setData({}, (old) => {
        if (!old) return old;
        return old.filter((record) => record.id !== id);
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.records.list.setData({}, context.previous);
      }
    },
    onSettled: () => {
      void invalidateEntityCaches(utils, 'records');
    },
  });

  // Record複製
  const duplicateRecord = api.records.duplicate.useMutation({
    // TIME_OVERLAPエラーはモーダル内でエラー表示（toastなし）
    onSettled: () => {
      void invalidateEntityCaches(utils, 'records');
    },
  });

  // 一括削除
  const bulkDeleteRecords = api.records.bulkDelete.useMutation({
    onMutate: async ({ ids }) => {
      await utils.records.list.cancel();
      const previous = utils.records.list.getData();

      const idSet = new Set(ids);
      utils.records.list.setData({}, (old) => {
        if (!old) return old;
        return old.filter((record) => !idSet.has(record.id));
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.records.list.setData({}, context.previous);
      }
    },
    onSettled: () => {
      void invalidateEntityCaches(utils, 'records');
    },
  });

  return {
    createRecord,
    updateRecord,
    deleteRecord,
    duplicateRecord,
    bulkDeleteRecords,
  };
}

// 型エクスポート
export type { CreateRecordInput, UpdateRecordInput };
