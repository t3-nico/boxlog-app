/**
 * Record データ取得フック
 * フィルタリング・ソート対応
 */

import type { DateRangeFilter } from '@/lib/date';
import { matchesDateRangeFilter } from '@/lib/date';
import { cacheStrategies } from '@/lib/tanstack-query/cache-config';
import { api } from '@/lib/trpc';

import type { RecordFilter } from '@/schemas/records';

import type {
  DurationFilter,
  FulfillmentFilter,
  WorkedAtFilter,
} from '../stores/useRecordFilterStore';

export interface RecordItem {
  id: string;
  plan_id: string | null;
  user_id: string;
  title?: string | null;
  worked_at: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  fulfillment_score: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  plan?: {
    id: string;
    title: string;
    status: string;
  } | null;
  tagIds: string[];
}

/**
 * Record フィルター型
 */
export interface RecordFilters {
  workedAt?: WorkedAtFilter;
  planSearch?: string;
  tags?: string[];
  fulfillment?: FulfillmentFilter;
  duration?: DurationFilter;
  search?: string;
  createdAt?: DateRangeFilter;
  updatedAt?: DateRangeFilter;
}

/**
 * API でサポートされているソートフィールド
 */
export type ApiSortField = 'worked_at' | 'duration_minutes' | 'created_at' | 'updated_at';

/**
 * Record ソートフィールド（クライアント側でサポート）
 */
export type RecordSortField =
  | 'worked_at'
  | 'duration_minutes'
  | 'fulfillment_score'
  | 'created_at'
  | 'updated_at'
  | 'title';

/**
 * API ソートフィールドかどうかを判定
 */
function isApiSortField(field: RecordSortField | null): field is ApiSortField {
  return (
    field === 'worked_at' ||
    field === 'duration_minutes' ||
    field === 'created_at' ||
    field === 'updated_at'
  );
}

/**
 * Record ソートオプション
 */
export interface RecordSortOptions {
  field: RecordSortField | null;
  direction: 'asc' | 'desc';
}

interface UseRecordDataOptions {
  filter?: Partial<RecordFilter>;
}

/**
 * 作業日フィルターの日付範囲を取得
 */
function getWorkedAtDateRange(filter: WorkedAtFilter): {
  from?: string;
  to?: string;
} {
  if (filter === 'all') return {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date): string => {
    const isoString = date.toISOString();
    const datePart = isoString.split('T')[0];
    return datePart ?? isoString.slice(0, 10);
  };

  switch (filter) {
    case 'today':
      return { from: formatDate(today), to: formatDate(today) };

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: formatDate(yesterday), to: formatDate(yesterday) };
    }

    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return { from: formatDate(startOfWeek), to: formatDate(endOfWeek) };
    }

    case 'last_week': {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
      return { from: formatDate(startOfLastWeek), to: formatDate(endOfLastWeek) };
    }

    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: formatDate(startOfMonth), to: formatDate(endOfMonth) };
    }

    default:
      return {};
  }
}

/**
 * 充実度フィルターの判定
 * @internal テスト用にエクスポート
 */
export function matchesFulfillmentFilter(score: number | null, filter: FulfillmentFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'unrated') return score === null;
  return score === parseInt(filter, 10);
}

/**
 * 時間フィルターの判定
 * @internal テスト用にエクスポート
 */
export function matchesDurationFilter(minutes: number, filter: DurationFilter): boolean {
  if (filter === 'all') return true;

  switch (filter) {
    case 'short':
      return minutes < 30;
    case 'medium':
      return minutes >= 30 && minutes <= 60;
    case 'long':
      return minutes > 60;
    default:
      return true;
  }
}

/**
 * Record 一覧を取得するフック（フィルタ・ソート対応）
 */
export function useRecordData(
  filters: RecordFilters = {},
  sort?: RecordSortOptions,
  options: UseRecordDataOptions = {},
) {
  const { filter } = options;

  // 作業日フィルターを日付範囲に変換
  const workedAtRange = filters.workedAt ? getWorkedAtDateRange(filters.workedAt) : {};

  // API でサポートされているソートフィールドのみを渡す
  const apiSortField = sort?.field && isApiSortField(sort.field) ? sort.field : undefined;

  const { data, isPending, error, refetch } = api.records.list.useQuery(
    {
      plan_id: filter?.plan_id,
      worked_at_from: workedAtRange.from ?? filter?.worked_at_from,
      worked_at_to: workedAtRange.to ?? filter?.worked_at_to,
      fulfillment_score_min: filter?.fulfillment_score_min,
      fulfillment_score_max: filter?.fulfillment_score_max,
      sortBy: apiSortField ?? filter?.sortBy ?? 'worked_at',
      sortOrder: sort?.direction ?? filter?.sortOrder ?? 'desc',
      limit: filter?.limit,
      offset: filter?.offset,
    },
    {
      ...cacheStrategies.records,
      retry: 1,
    },
  );

  let items = (data ?? []) as RecordItem[];

  // Plan タイトル検索（クライアント側）
  if (filters.planSearch) {
    const searchLower = filters.planSearch.toLowerCase();
    items = items.filter((item) => item.plan?.title?.toLowerCase().includes(searchLower));
  }

  // タグフィルタリング（クライアント側、OR条件）
  if (filters.tags && filters.tags.length > 0) {
    items = items.filter((item) => {
      const itemTagIds = item.tagIds ?? [];
      return filters.tags!.some((filterTagId) => itemTagIds.includes(filterTagId));
    });
  }

  // 充実度フィルタリング（クライアント側）
  if (filters.fulfillment && filters.fulfillment !== 'all') {
    items = items.filter((item) =>
      matchesFulfillmentFilter(item.fulfillment_score, filters.fulfillment!),
    );
  }

  // 時間フィルタリング（クライアント側）
  if (filters.duration && filters.duration !== 'all') {
    items = items.filter((item) => matchesDurationFilter(item.duration_minutes, filters.duration!));
  }

  // タイトル/メモ検索（クライアント側）
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower),
    );
  }

  // 作成日フィルタリング（クライアント側）
  if (filters.createdAt && filters.createdAt !== 'all') {
    items = items.filter((item) => matchesDateRangeFilter(item.created_at, filters.createdAt!));
  }

  // 更新日フィルタリング（クライアント側）
  if (filters.updatedAt && filters.updatedAt !== 'all') {
    items = items.filter((item) => matchesDateRangeFilter(item.updated_at, filters.updatedAt!));
  }

  // クライアント側ソート（API ソートと異なる場合）
  if (sort?.field && sort?.direction) {
    items = [...items].sort((a, b) => {
      const field = sort.field as keyof RecordItem;
      const aValue = a[field];
      const bValue = b[field];

      // null 値の処理
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sort.direction === 'asc' ? 1 : -1;
      if (bValue === null) return sort.direction === 'asc' ? -1 : 1;

      // 日付フィールドの場合
      if (field === 'worked_at' || field === 'created_at' || field === 'updated_at') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sort.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // 数値フィールドの場合
      if (field === 'duration_minutes' || field === 'fulfillment_score') {
        const aNum = aValue as number;
        const bNum = bValue as number;
        return sort.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // 文字列フィールドの場合
      const aStr = String(aValue ?? '');
      const bStr = String(bValue ?? '');
      const comparison = aStr.localeCompare(bStr, 'ja');
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  return {
    items,
    isPending,
    error,
    refetch,
  };
}

/**
 * 最近の Record を取得するフック（複製用）
 */
export function useRecentRecords(limit: number = 5) {
  const { data, isPending } = api.records.getRecent.useQuery(
    { limit },
    {
      ...cacheStrategies.records,
      retry: 1,
    },
  );

  return {
    items: (data ?? []) as RecordItem[],
    isPending,
  };
}
