import type { CalendarEvent } from '../../../types/calendar.types';

import type { BaseViewProps } from '../shared';

/**
 * AgendaViewProps
 * BaseViewPropsを継承し、リスト表示に必要な最小限のプロパティのみ使用
 *
 * データは親コンポーネント（useCalendarData）から渡される
 * 日付範囲はcalculateViewDateRangeで制御（agenda用に60日）
 */
export type AgendaViewProps = BaseViewProps;

export interface AgendaItemProps {
  plan: CalendarEvent;
  onClick?: ((plan: CalendarEvent) => void) | undefined;
  onContextMenu?: ((plan: CalendarEvent, mouseEvent: React.MouseEvent) => void) | undefined;
}

export interface AgendaDayGroupProps {
  date: Date;
  plans: CalendarEvent[];
  onPlanClick?: ((plan: CalendarEvent) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarEvent, mouseEvent: React.MouseEvent) => void) | undefined;
}
