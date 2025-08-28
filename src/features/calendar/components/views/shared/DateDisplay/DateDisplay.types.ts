export interface DateDisplayProps {
  date: Date
  className?: string
  isToday?: boolean
  isSelected?: boolean
  showDayName?: boolean
  showMonthYear?: boolean
  dayNameFormat?: 'short' | 'long' | 'narrow'
  dateFormat?: string
  onClick?: (date: Date) => void
  onDoubleClick?: (date: Date) => void
}

export interface DateDisplayRowProps {
  dates: Date[]
  className?: string
  selectedDate?: Date
  showDayNames?: boolean
  showMonthYear?: boolean
  dayNameFormat?: 'short' | 'long' | 'narrow'
  dateFormat?: string
  onDateClick?: (date: Date) => void
  onDateDoubleClick?: (date: Date) => void
}

export interface DateDisplayStyleProps {
  isToday: boolean
  isSelected: boolean
  isWeekend?: boolean
}