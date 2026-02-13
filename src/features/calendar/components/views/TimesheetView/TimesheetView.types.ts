import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import type { BaseViewProps } from '../shared/types/base.types';

/** TimesheetView のプロパティ（AgendaView と同パターン） */
export interface TimesheetViewProps extends BaseViewProps {}

/** タグごとのグループ */
export interface TimesheetTagGroup {
  tagId: string | null;
  tagName: string;
  tagColor: string;
  parentId: string | null;
  plans: CalendarPlan[];
  /** 日別duration合計（分）。key: 'YYYY-MM-DD' */
  dailyTotals: Record<string, number>;
  /** 週合計（分） */
  weekTotal: number;
}

/** useTimesheetData の返り値 */
export interface TimesheetData {
  tagGroups: TimesheetTagGroup[];
  /** 全体の日別合計（分）。key: 'YYYY-MM-DD' */
  dailyTotals: Record<string, number>;
  /** 全体の週合計（分） */
  weekTotal: number;
  /** 7日分の日付 */
  weekDates: Date[];
}
