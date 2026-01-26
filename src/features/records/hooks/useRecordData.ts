/**
 * Record データ取得フック
 */

import { api } from '@/lib/trpc';

import type { RecordFilter } from '@/schemas/records';

export interface RecordItem {
  id: string;
  plan_id: string;
  user_id: string;
  worked_at: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  fulfillment_score: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  plan?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

interface UseRecordDataOptions {
  filter?: Partial<RecordFilter>;
}

/**
 * Record一覧を取得するフック
 */
export function useRecordData(options: UseRecordDataOptions = {}) {
  const { filter } = options;

  const { data, isPending, error, refetch } = api.records.list.useQuery({
    plan_id: filter?.plan_id,
    worked_at_from: filter?.worked_at_from,
    worked_at_to: filter?.worked_at_to,
    fulfillment_score_min: filter?.fulfillment_score_min,
    fulfillment_score_max: filter?.fulfillment_score_max,
    sortBy: filter?.sortBy ?? 'worked_at',
    sortOrder: filter?.sortOrder ?? 'desc',
    limit: filter?.limit,
    offset: filter?.offset,
  });

  return {
    items: (data ?? []) as RecordItem[],
    isPending,
    error,
    refetch,
  };
}

/**
 * 最近のRecordを取得するフック（複製用）
 */
export function useRecentRecords(limit: number = 5) {
  const { data, isPending } = api.records.getRecent.useQuery({ limit });

  return {
    items: (data ?? []) as RecordItem[],
    isPending,
  };
}
