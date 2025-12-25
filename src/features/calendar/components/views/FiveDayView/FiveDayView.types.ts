import type { CSSProperties } from 'react';

import type { BaseViewProps, CalendarPlan } from '../shared';

// FiveDayViewの固有Props（BaseViewPropsを継承）
export interface FiveDayViewProps extends BaseViewProps {
  centerDate?: Date; // 中央に表示する日付（指定がない場合はcurrentDateを使用）
}

// useFiveDayViewフックのオプション
export interface UseFiveDayViewOptions {
  centerDate: Date;
  events: CalendarPlan[];
  onPlanUpdate?: (plan: CalendarPlan) => void;
}

// useFiveDayViewフックの返却値
export interface UseFiveDayViewReturn {
  fiveDayDates: Date[]; // [day-2, day-1, today, day+1, day+2]
  eventsByDate: Record<string, CalendarPlan[]>;
  centerIndex: number; // 中央の日付のインデックス（通常は2）
  todayIndex: number; // 今日のインデックス（-1 if not in range）
  scrollToNow: () => void;
  isCurrentDay: boolean; // 中央の日付が今日かどうか
}

// 5日ビューでのイベント位置情報
export interface FiveDayEventPosition {
  plan: CalendarPlan;
  dayIndex: number;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
  column: number;
  totalColumns: number;
}

// 時間スロット情報
export interface FiveDayTimeSlot {
  time: string;
  hour: number;
  minute: number;
  label: string;
  isHour: boolean;
  isHalfHour: boolean;
  isQuarterHour: boolean;
}

// 5日ビューの設定
export interface FiveDayViewSettings {
  startHour: number;
  endHour: number;
  timeInterval: 15 | 30 | 60; // minutes
  showQuarterLines: boolean;
  showCurrentTime: boolean;
  maxEventColumns: number;
  eventMinHeight: number;
  dayColumnWidth: number; // 各日の列幅（%） = 100/5 = 20%
}

// 日付ヘッダーの情報
export interface FiveDayDateDisplay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isCenter: boolean; // 中央の日付かどうか
  isPast: boolean;
  isFuture: boolean;
  events: CalendarPlan[];
  eventCount: number;
}

// イベントのスタイル情報
export interface FiveDayEventStyle {
  position: CSSProperties;
  color: string;
  textColor: string;
  borderColor: string;
  opacity: number;
}

// FiveDay Grid コンポーネントのProps
export interface FiveDayGridProps {
  fiveDayDates: Date[];
  events: CalendarPlan[];
  eventsByDate: Record<string, CalendarPlan[]>;
  centerIndex: number;
  todayIndex: number;
  onPlanClick?: (plan: CalendarPlan) => void;
  onPlanContextMenu?: (plan: CalendarPlan, mouseEvent: React.MouseEvent) => void;
  onEmptyClick?: (date: Date, time: string) => void;
  onPlanUpdate?: (plan: CalendarPlan) => void;
  className?: string;
}
