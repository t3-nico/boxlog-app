import { useEntityTagsHook } from '@/hooks/createEntityTagsHook';
import { api } from '@/lib/trpc';

/**
 * プラン・セッションとタグの関連付け管理フック
 *
 * tRPC APIを使用してプランとタグの関連付けを管理します。
 * 楽観的更新により、タグの追加・削除が即座にUIに反映されます。
 *
 * 注意: plan.tagIds（IDのみ）を管理し、タグの詳細情報はtags.listキャッシュから取得する。
 */
export function usePlanTags() {
  const utils = api.useUtils();

  const { isLoading, error, addTag, removeTag, setTags } = useEntityTagsHook(
    {
      entityName: 'plans',
      entityIdField: 'planId',
      enableTagStats: true,
    },
    utils,
  );

  return {
    // State
    isLoading,
    error,

    // Plan Tag Actions
    addPlanTag: addTag,
    removePlanTag: removeTag,
    setPlanTags: setTags,
  };
}
