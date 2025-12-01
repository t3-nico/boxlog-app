export interface DateDisplayProps {
  date: Date
  className?: string | undefined
  isToday?: boolean | undefined
  isSelected?: boolean | undefined
  showDayName?: boolean | undefined
  showMonthYear?: boolean | undefined
  dayNameFormat?: 'short' | 'long' | 'narrow' | undefined
  dateFormat?: string | undefined
  onClick?: ((date: Date) => void) | undefined
  onDoubleClick?: ((date: Date) => void) | undefined
}

export interface DateDisplayRowProps {
  dates: Date[]
  className?: string | undefined
  selectedDate?: Date | undefined
  showDayNames?: boolean | undefined
  showMonthYear?: boolean | undefined
  dayNameFormat?: 'short' | 'long' | 'narrow' | undefined
  dateFormat?: string | undefined
  onDateClick?: ((date: Date) => void) | undefined
  onDateDoubleClick?: ((date: Date) => void) | undefined
}

export interface DateDisplayStyleProps {
  isToday: boolean
  isSelected: boolean
  isWeekend?: boolean | undefined
}
