import { useEntityTagsHook } from '@/hooks/createEntityTagsHook';
import { api } from '@/lib/trpc';

/**
 * レコードとタグの関連付け管理フック
 *
 * tRPC APIを使用してレコードとタグの関連付けを管理します。
 * 楽観的更新により、タグの追加・削除が即座にUIに反映されます。
 *
 * 注意: record.tagIds（IDのみ）を管理し、タグの詳細情報はtags.listキャッシュから取得する。
 */
export function useRecordTags() {
  const utils = api.useUtils();

  const { isLoading, error, addTag, removeTag, setTags } = useEntityTagsHook(
    {
      entityName: 'records',
      entityIdField: 'recordId',
    },
    utils,
  );

  return {
    // State
    isLoading,
    error,

    // Record Tag Actions
    addRecordTag: addTag,
    removeRecordTag: removeTag,
    setRecordTags: setTags,
  };
}
