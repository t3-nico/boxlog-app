// タグ取得用クエリフック

import { trpc } from '@/lib/trpc/client';

// タグ一覧取得フック
// Note: selectを使わず直接data.dataにアクセスする
// selectを使うとsetData()でキャッシュ更新しても再評価がトリガーされない場合がある
export function useTags() {
  const query = trpc.tags.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  // Note: useMemoを使わずquery.data?.dataを直接返す
  // TanStack Queryの構造共有により、データが変わっていなければ参照は安定している
  // useMemoを使うとsetData()によるキャッシュ更新が検出されない場合がある
  return {
    ...query,
    data: query.data?.data,
  };
}

// 単一タグ取得フック（ID別）
export function useTag(id: string) {
  return trpc.tags.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    },
  );
}
