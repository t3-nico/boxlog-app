/**
 * Plan用データ取得フック
 * Board/Table共通のデータフェッチングhooks
 * TanStack Query統合済み
 */

import { useplans } from '@/features/plans/hooks/usePlans';
import type { Plan, PlanStatus } from '@/features/plans/types/plan';
import { normalizeStatus } from '@/features/plans/utils/status';
import type {
  DateRangeFilter,
  DueDateFilter,
  RecurrenceFilter,
  ReminderFilter,
  ScheduleFilter,
} from '../stores/usePlanFilterStore';

/**
 * ソートオプション
 */
export type SortField = 'title' | 'status' | 'created_at' | 'updated_at' | 'due_date';
export type SortDirection = 'asc' | 'desc';

export interface PlanSortOptions {
  field: SortField | null;
  direction: SortDirection;
}

/**
 * APIから返されるプランデータの型
 * tagIdsはplan-serviceのformatPlanWithTagsで変換済み
 * @internal テスト用にエクスポート
 */
export type PlanWithTagIds = Plan & {
  tagIds?: string[];
};

/**
 * Planアイテム
 */
export interface PlanItem {
  id: string;
  type: 'plan';
  title: string;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
  plan_number?: string | undefined;
  planned_hours?: number | undefined;
  description?: string | undefined;
  due_date?: string | null | undefined; // 期限日（YYYY-MM-DD）
  start_time?: string | null | undefined; // 開始時刻（ISO 8601）
  end_time?: string | null | undefined; // 終了時刻（ISO 8601）
  reminder_minutes?: number | null | undefined; // 通知タイミング（開始時刻の何分前か）
  recurrence_type?:
    | 'none'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'weekdays'
    | null
    | undefined; // 繰り返しタイプ（シンプル版）
  recurrence_end_date?: string | null | undefined; // 繰り返し終了日（YYYY-MM-DD）
  recurrence_rule?: string | null | undefined; // カスタム繰り返し（RRULE形式）
  tagIds?: string[] | undefined; // タグIDリスト（タグ情報はtags.listキャッシュから取得）
}

/**
 * Planフィルター型
 */
export interface PlanFilters {
  status?: PlanStatus | undefined;
  search?: string | undefined;
  tags?: string[] | undefined; // タグIDの配列
  dueDate?: DueDateFilter | undefined; // 期限フィルター
  recurrence?: RecurrenceFilter | undefined; // 繰り返しフィルター
  reminder?: ReminderFilter | undefined; // リマインダーフィルター
  schedule?: ScheduleFilter | undefined; // スケジュールフィルター
  createdAt?: DateRangeFilter | undefined; // 作成日フィルター
  updatedAt?: DateRangeFilter | undefined; // 更新日フィルター
  hideCompleted?: boolean | undefined; // 完了を非表示
}

/**
 * 期限フィルターの判定
 * @internal テスト用にエクスポート
 */
export function matchesDueDateFilter(
  dueDate: string | null | undefined,
  filter: DueDateFilter,
): boolean {
  if (filter === 'all') return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 期限なしフィルター
  if (filter === 'no_due_date') {
    return !dueDate;
  }

  // 期限ありフィルターは期限がない場合false
  if (!dueDate) return false;

  const itemDate = new Date(dueDate);
  itemDate.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'today':
      return itemDate.getTime() === today.getTime();

    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return itemDate.getTime() === tomorrow.getTime();
    }

    case 'this_week': {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + (6 - today.getDay()));
      return itemDate >= today && itemDate <= endOfWeek;
    }

    case 'next_week': {
      const startOfNextWeek = new Date(today);
      startOfNextWeek.setDate(startOfNextWeek.getDate() + (7 - today.getDay()));
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 6);
      return itemDate >= startOfNextWeek && itemDate <= endOfNextWeek;
    }

    case 'overdue':
      return itemDate < today;

    default:
      return true;
  }
}

/**
 * 日付範囲フィルターの判定（作成日・更新日共通）
 * @internal テスト用にエクスポート
 */
export function matchesDateRangeFilter(
  dateStr: string | null | undefined,
  filter: DateRangeFilter,
): boolean {
  if (filter === 'all') return true;
  if (!dateStr) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const itemDate = new Date(dateStr);
  itemDate.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'today':
      return itemDate.getTime() === today.getTime();

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return itemDate.getTime() === yesterday.getTime();
    }

    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    }

    case 'last_week': {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
      return itemDate >= startOfLastWeek && itemDate <= endOfLastWeek;
    }

    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return itemDate >= startOfMonth && itemDate <= endOfMonth;
    }

    default:
      return true;
  }
}

/**
 * 繰り返しフィルターの判定
 */
function matchesRecurrenceFilter(
  recurrenceType: string | null | undefined,
  filter: RecurrenceFilter,
): boolean {
  if (filter === 'all') return true;
  const hasRecurrence = recurrenceType && recurrenceType !== 'none';
  return filter === 'yes' ? !!hasRecurrence : !hasRecurrence;
}

/**
 * リマインダーフィルターの判定
 */
function matchesReminderFilter(
  reminderMinutes: number | null | undefined,
  filter: ReminderFilter,
): boolean {
  if (filter === 'all') return true;
  const hasReminder = reminderMinutes !== null && reminderMinutes !== undefined;
  return filter === 'yes' ? hasReminder : !hasReminder;
}

/**
 * スケジュールフィルターの判定
 */
function matchesScheduleFilter(
  startTime: string | null | undefined,
  filter: ScheduleFilter,
): boolean {
  if (filter === 'all') return true;
  const isScheduled = !!startTime;
  return filter === 'scheduled' ? isScheduled : !isScheduled;
}

/**
 * PlanをPlanItemに変換
 * @internal テスト用にエクスポート
 */
export function planToPlanItem(plan: PlanWithTagIds): PlanItem {
  return {
    id: plan.id,
    type: 'plan',
    title: plan.title,
    status: normalizeStatus(plan.status),
    created_at: plan.created_at ?? new Date().toISOString(),
    updated_at: plan.updated_at ?? new Date().toISOString(),
    description: plan.description ?? undefined,
    due_date: plan.due_date,
    start_time: plan.start_time,
    end_time: plan.end_time,
    recurrence_type: plan.recurrence_type,
    recurrence_end_date: plan.recurrence_end_date,
    recurrence_rule: plan.recurrence_rule,
    tagIds: plan.tagIds,
  };
}

/**
 * Plan用データ取得フック
 * Board/Table共通のデータを取得
 *
 * @param filters - フィルター条件
 * @returns Planアイテム、ローディング状態、エラー情報
 *
 * @example
 * ```tsx
 * const { items, isPending, error } = usePlanData(
 *   { status: 'open' },
 *   { field: 'title', direction: 'asc' }
 * )
 *
 * if (isPending) return <div>Loading...</div>
 * if (error) return <div>Error: {error.message}</div>
 *
 * return (
 *   <div>
 *     {items.map(item => (
 *       <div key={item.id}>{item.title}</div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function usePlanData(filters: PlanFilters = {}, sort?: PlanSortOptions) {
  // plansの取得（リアルタイム性最適化済み）
  const {
    data: plansData,
    isPending,
    error,
  } = useplans({
    ...(filters.status && { status: filters.status }),
    ...(filters.search && { search: filters.search }),
  });

  // PlanをPlanItemに変換
  // APIレスポンスの型はPlanWithTagIdsと互換性がある
  let items: PlanItem[] = plansData?.map((plan) => planToPlanItem(plan as PlanWithTagIds)) || [];

  // ステータスフィルタリング（クライアント側 - 楽観的更新後の即座反映用）
  // サーバーからのデータはstatus指定済みだが、楽観的更新で変更された場合に即座に反映
  if (filters.status) {
    items = items.filter((item) => item.status === filters.status);
  }

  // タグフィルタリング（クライアント側）
  if (filters.tags && filters.tags.length > 0) {
    items = items.filter((item) => {
      const itemTagIds = item.tagIds ?? [];
      // フィルタータグのいずれかに一致するかチェック（OR条件）
      return filters.tags!.some((filterTagId) => itemTagIds.includes(filterTagId));
    });
  }

  // 期限フィルタリング（クライアント側）
  if (filters.dueDate && filters.dueDate !== 'all') {
    items = items.filter((item) => matchesDueDateFilter(item.due_date, filters.dueDate!));
  }

  // 繰り返しフィルタリング（クライアント側）
  if (filters.recurrence && filters.recurrence !== 'all') {
    items = items.filter((item) =>
      matchesRecurrenceFilter(item.recurrence_type, filters.recurrence!),
    );
  }

  // リマインダーフィルタリング（クライアント側）
  if (filters.reminder && filters.reminder !== 'all') {
    items = items.filter((item) => matchesReminderFilter(item.reminder_minutes, filters.reminder!));
  }

  // スケジュールフィルタリング（クライアント側）
  if (filters.schedule && filters.schedule !== 'all') {
    items = items.filter((item) => matchesScheduleFilter(item.start_time, filters.schedule!));
  }

  // 作成日フィルタリング（クライアント側）
  if (filters.createdAt && filters.createdAt !== 'all') {
    items = items.filter((item) => matchesDateRangeFilter(item.created_at, filters.createdAt!));
  }

  // 更新日フィルタリング（クライアント側）
  if (filters.updatedAt && filters.updatedAt !== 'all') {
    items = items.filter((item) => matchesDateRangeFilter(item.updated_at, filters.updatedAt!));
  }

  // 完了を非表示フィルタリング（クライアント側）
  if (filters.hideCompleted) {
    items = items.filter((item) => item.status !== 'closed');
  }

  // ソート適用
  if (sort?.field && sort?.direction) {
    items.sort((a, b) => {
      const field = sort.field as keyof PlanItem;
      const aValue = a[field];
      const bValue = b[field];

      // 日付フィールドの場合
      if (field === 'created_at' || field === 'updated_at') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sort.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      // 文字列フィールドの場合
      const aStr = String(aValue ?? '');
      const bStr = String(bValue ?? '');
      const comparison = aStr.localeCompare(bStr, 'ja');
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  } else {
    // デフォルト: 更新日時の降順でソート
    items.sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }

  return {
    items,
    plans: plansData || [],
    isPending,
    error,
  };
}

/**
 * plans専用データ取得フック
 * usePlanDataのエイリアス
 *
 * @param filters - フィルター条件
 * @param sort - ソートオプション
 * @returns plansデータ
 */
export function usePlanPlans(filters: PlanFilters = {}, sort?: PlanSortOptions) {
  return usePlanData(filters, sort);
}
