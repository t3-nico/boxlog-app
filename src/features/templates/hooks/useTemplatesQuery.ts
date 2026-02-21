// テンプレート取得用クエリフック

import { trpc } from '@/lib/trpc/client';

// テンプレート一覧取得フック
export function useTemplates() {
  const query = trpc.templates.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  return {
    ...query,
    data: query.data?.data,
  };
}

// 単一テンプレート取得フック（ID別）
export function useTemplate(id: string) {
  return trpc.templates.getById.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    },
  );
}
