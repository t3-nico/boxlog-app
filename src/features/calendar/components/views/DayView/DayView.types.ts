import type { CSSProperties } from 'react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';

import type { DateTimeSelection, GridViewProps, TimeSlot } from '../shared';

// DayViewの固有Props（GridViewPropsを継承して時間グリッド機能を使用）
export interface DayViewProps extends GridViewProps {
  // DayView固有のプロパティがあれば追加
}

// シンプル版のProps（後方互換性のため）
export interface SimpleDayViewProps {
  date: Date;
  plans?: CalendarPlan[];
  className?: string;
  onPlanClick?: (plan: CalendarPlan) => void;
  onEmptyClick?: (date: Date, time: string) => void;
  onPlanUpdate?: (plan: CalendarPlan) => void;
  onPlanCreate?: (date: Date, time: string) => void;
  onPlanDelete?: (planId: string) => void;
}

export interface DayContentProps {
  date: Date;
  plans?: CalendarPlan[] | undefined;
  events?: CalendarPlan[] | undefined; // eventsはplansのエイリアス（後方互換性のため）
  planStyles?: Record<string, CSSProperties> | undefined;
  eventStyles?: Record<string, CSSProperties> | undefined; // eventStylesはplanStylesのエイリアス（後方互換性のため）
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarPlan, mouseEvent: React.MouseEvent) => void) | undefined;
  onEmptyAreaContextMenu?:
    | ((date: Date, hour: number, minute: number, e: React.MouseEvent) => void)
    | undefined;
  onEmptyClick?: ((date: Date, time: string) => void) | undefined;
  onPlanUpdate?: ((plan: CalendarPlan) => void) | undefined;
  onEventUpdate?:
    | ((
        eventId: string,
        updates: { startTime: Date; endTime: Date },
      ) => Promise<void | { skipToast: true }>)
    | undefined; // D&D用
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined;
  className?: string | undefined;
  /** DnDを無効化するプランID（Inspector表示中のプランなど） */
  disabledPlanId?: string | null | undefined;
}

export interface UseDayViewOptions {
  date: Date;
  plans: CalendarPlan[];
  onPlanUpdate?: (plan: CalendarPlan) => void;
}

export interface UseDayViewReturn {
  dayPlans: CalendarPlan[];
  planStyles: Record<string, CSSProperties>;
  isToday: boolean;
  timeSlots: TimeSlot[];
}

export interface UseDayPlansOptions {
  date: Date;
  plans: CalendarPlan[];
}

export interface UseDayPlansReturn {
  dayPlans: CalendarPlan[];
  planPositions: PlanPosition[];
  maxConcurrentPlans: number;
}

export interface PlanPosition {
  plan: CalendarPlan;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
  column: number;
  totalColumns: number;
}

export interface DayViewSettings {
  startHour: number;
  endHour: number;
  timeInterval: 15 | 30 | 60; // minutes
  showQuarterLines: boolean;
  showCurrentTime: boolean;
  maxPlanColumns: number;
  planMinHeight: number;
}
