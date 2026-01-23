/**
 * ビュー関連の型定義
 */

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import type { PlanInteractionHandler } from './plan.types';

export type ViewType = 'day' | '3day' | '5day' | 'week' | 'agenda';

export interface ViewProps {
  dates: Date[];
  events: CalendarPlan[];
  currentDate: Date;
  viewType: ViewType;
  className?: string;
}

export interface DayColumnProps {
  date: Date;
  events: CalendarPlan[];
  hourHeight?: number | undefined;
  isToday?: boolean | undefined;
  isWeekend?: boolean | undefined;
  onTimeClick?: ((date: Date, hour: number, minute: number) => void) | undefined;
  onEventClick?: ((plan: CalendarPlan) => void) | undefined;
  onEventContextMenu?: ((plan: CalendarPlan, e: React.MouseEvent) => void) | undefined;
  className?: string | undefined;
}

export interface DayDisplayProps {
  date: Date;
  isToday?: boolean;
  isWeekend?: boolean;
  isSelected?: boolean;
  format?: 'short' | 'long' | 'numeric';
  onClick?: (date: Date) => void;
  className?: string;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ReactNode;
  actions?: React.ReactNode;
  hint?: string;
  className?: string;
}

export interface ViewDimensions {
  containerWidth: number;
  containerHeight: number;
  contentWidth: number;
  contentHeight: number;
  scrollTop: number;
  scrollLeft: number;
  visibleTimeRange: {
    start: number; // 開始時間（0-24）
    end: number; // 終了時間（0-24）
  };
}

export interface ScrollSyncOptions {
  horizontal?: boolean;
  vertical?: boolean;
  initialScrollTop?: number;
  initialScrollLeft?: number;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
}

export interface ViewNavigationProps {
  currentDate: Date;
  viewType: ViewType;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (viewType: ViewType) => void;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export interface ViewConfiguration {
  hourHeight: number;
  timeColumnWidth: number;
  showTimeColumn: boolean;
  showAllDaySection: boolean;
  showWeekends: boolean;
  showCurrentTime: boolean;
  startHour: number;
  endHour: number;
  scrollToHour: number;
}

export interface ViewContextValue extends ViewConfiguration, PlanInteractionHandler {
  dates: Date[];
  events: CalendarPlan[];
  currentDate: Date;
  viewType: ViewType;
}
