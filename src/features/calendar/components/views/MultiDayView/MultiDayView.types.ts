import type { GridViewProps } from '../shared';

export interface MultiDayViewProps extends GridViewProps {
  /** 表示する日数（2-9） */
  dayCount: number;
  centerDate?: Date;
}
