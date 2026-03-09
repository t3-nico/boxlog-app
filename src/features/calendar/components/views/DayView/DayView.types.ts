import type { CSSProperties } from 'react';

import type { CalendarEvent } from '../../../types/calendar.types';

import type { DateTimeSelection, GridViewProps, TimeSlot } from '../shared';

// DayViewの固有Props（GridViewPropsを継承して時間グリッド機能を使用）
export type DayViewProps = GridViewProps;

// シンプル版のProps（後方互換性のため）
export interface SimpleDayViewProps {
  date: Date;
  plans?: CalendarEvent[];
  className?: string;
  onPlanClick?: (plan: CalendarEvent) => void;
  onPlanUpdate?: (plan: CalendarEvent) => void;
  onPlanCreate?: (date: Date, time: string) => void;
  onPlanDelete?: (planId: string) => void;
}

export interface DayContentProps {
  date: Date;
  plans?: CalendarEvent[] | undefined;
  events?: CalendarEvent[] | undefined; // eventsはplansのエイリアス（後方互換性のため）
  planStyles?: Record<string, CSSProperties> | undefined;
  eventStyles?: Record<string, CSSProperties> | undefined; // eventStylesはplanStylesのエイリアス（後方互換性のため）
  onPlanClick?: ((plan: CalendarEvent) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarEvent, mouseEvent: React.MouseEvent) => void) | undefined;
  onEmptyAreaContextMenu?:
    | ((date: Date, hour: number, minute: number, e: React.MouseEvent) => void)
    | undefined;
  onPlanUpdate?: ((plan: CalendarEvent) => void) | undefined;
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
  plans: CalendarEvent[];
  onPlanUpdate?: (plan: CalendarEvent) => void;
  timezone: string;
}

export interface UseDayViewReturn {
  dayPlans: CalendarEvent[];
  planStyles: Record<string, CSSProperties>;
  isToday: boolean;
  timeSlots: TimeSlot[];
}

export interface UseDayPlansOptions {
  date: Date;
  plans: CalendarEvent[];
  timezone: string;
}

export interface UseDayPlansReturn {
  dayPlans: CalendarEvent[];
  planPositions: PlanPosition[];
  maxConcurrentPlans: number;
}

export interface PlanPosition {
  plan: CalendarEvent;
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
