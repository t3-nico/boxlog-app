// タググループ管理用のReact Queryフック

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cacheStrategies } from '@/lib/tanstack-query/cache-config';

import type {
  CreateTagGroupInput,
  TagGroup,
  TagGroupsResponse,
  TagGroupWithTags,
  UpdateTagGroupInput,
} from '@/features/tags/types';

/**
 * APIレスポンスからエラーメッセージを抽出
 * @param response - Fetchレスポンス
 * @param fallbackMessage - JSONパース失敗時のフォールバックメッセージ
 */
async function extractErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.error || errorData.message || fallbackMessage;
  } catch {
    return `${fallbackMessage} (HTTP ${response.status})`;
  }
}

/**
 * APIエラーをスロー
 */
async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  const message = await extractErrorMessage(response, fallbackMessage);
  throw new Error(message);
}

// API関数群
const tagGroupAPI = {
  // 全タググループ取得
  async fetchTagGroups(): Promise<TagGroup[]> {
    const response = await fetch('/api/tag-groups');
    if (!response.ok) {
      await throwApiError(response, 'タググループの取得に失敗しました');
    }

    const data: TagGroupsResponse = await response.json();
    return data.data;
  },

  // 個別タググループ取得（タグ付き）
  async fetchTagGroup(id: string, withTags = false): Promise<TagGroup | TagGroupWithTags> {
    const params = withTags ? '?with_tags=true' : '';
    const response = await fetch(`/api/tag-groups/${id}${params}`);
    if (!response.ok) {
      await throwApiError(response, 'タググループの取得に失敗しました');
    }

    const data = await response.json();
    return data.data;
  },

  // タググループ作成
  async createTagGroup(input: CreateTagGroupInput): Promise<TagGroup> {
    const response = await fetch('/api/tag-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      await throwApiError(response, 'タググループの作成に失敗しました');
    }

    const data = await response.json();
    return data.data;
  },

  // タググループ更新
  async updateTagGroup(id: string, input: UpdateTagGroupInput): Promise<TagGroup> {
    const response = await fetch(`/api/tag-groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      await throwApiError(response, 'タググループの更新に失敗しました');
    }

    const data = await response.json();
    return data.data;
  },

  // タググループ削除
  async deleteTagGroup(id: string): Promise<void> {
    const response = await fetch(`/api/tag-groups/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      await throwApiError(response, 'タググループの削除に失敗しました');
    }
  },

  // タググループ並び替え（バルク更新）
  async reorderTagGroups(groupIds: string[]): Promise<TagGroup[]> {
    const response = await fetch('/api/tag-groups/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupIds }),
    });

    if (!response.ok) {
      await throwApiError(response, 'タググループの並び替えに失敗しました');
    }

    const data = await response.json();
    return data.data;
  },
};

// Query Keys
export const tagGroupKeys = {
  all: ['tag-groups'] as const,
  lists: () => [...tagGroupKeys.all, 'list'] as const,
  list: () => [...tagGroupKeys.lists()] as const,
  details: () => [...tagGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagGroupKeys.details(), id] as const,
  detailWithTags: (id: string) => [...tagGroupKeys.details(), id, 'with-tags'] as const,
};

/**
 * 全タググループ取得
 * @param options - React Query オプション（enabledなど）
 */
export function useTagGroups(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tagGroupKeys.list(),
    queryFn: () => tagGroupAPI.fetchTagGroups(),
    ...cacheStrategies.tagGroups,
    ...options,
  });
}

/**
 * 個別タググループ取得
 */
export function useTagGroup(id: string, withTags = false) {
  return useQuery({
    queryKey: withTags ? tagGroupKeys.detailWithTags(id) : tagGroupKeys.detail(id),
    queryFn: () => tagGroupAPI.fetchTagGroup(id, withTags),
    enabled: !!id,
    ...cacheStrategies.tagGroups,
  });
}

/**
 * タググループ作成
 */
export function useCreateTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagGroupInput) => tagGroupAPI.createTagGroup(input),
    onSuccess: () => {
      // タググループ一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.lists() });
    },
  });
}

/**
 * タググループ更新
 */
export function useUpdateTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagGroupInput }) =>
      tagGroupAPI.updateTagGroup(id, data),
    onSuccess: (_, variables) => {
      // 更新したグループのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.detailWithTags(variables.id) });
      // 一覧も無効化
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.lists() });
    },
  });
}

/**
 * タググループ削除
 */
export function useDeleteTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagGroupAPI.deleteTagGroup(id),
    onSuccess: (_, id) => {
      // 削除したグループのキャッシュを削除
      queryClient.removeQueries({ queryKey: tagGroupKeys.detail(id) });
      queryClient.removeQueries({ queryKey: tagGroupKeys.detailWithTags(id) });
      // 一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.lists() });
      // タグ一覧も無効化（group_idがNULLになったタグがあるため）
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * タググループの並び替え（バルク更新）
 */
export function useReorderTagGroups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupIds: string[]) => tagGroupAPI.reorderTagGroups(groupIds),
    onSuccess: () => {
      // 一覧を無効化して再取得
      queryClient.invalidateQueries({ queryKey: tagGroupKeys.lists() });
    },
  });
}
