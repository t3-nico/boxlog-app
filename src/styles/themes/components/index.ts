/**
 * コンポーネントスタイル統合エクスポート
 * 
 * 全コンポーネントのスタイル定義を中央管理し、
 * 統一されたインターフェースでアクセス可能にする
 */

// Button 関連のスタイル
export {
  buttonVariants,
  dangerButtonVariants,
  buttonStates,
  iconButtonStyles,
  buttonGroupStyles
} from './button.styles'

// Form 関連のスタイル  
export {
  formElementStates,
  inputVariants,
  selectVariants,
  checkboxVariants,
  radioVariants,
  switchVariants,
  textareaVariants,
  labelVariants,
  formGroupStyles,
  specialFormStyles,
  validationStyles
} from './form.styles'

// Card 関連のスタイル
export {
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardActionVariants,
  cardContentVariants,
  cardFooterVariants,
  specialCardStyles,
  cardLayoutStyles,
  cardSpacing
} from './card.styles'

// Calendar 関連のスタイル
export {
  eventBlockVariants,
  currentTimeLineStyles,
  gridLineStyles,
  timeColumnStyles,
  dateHeaderVariants,
  calendarLayoutStyles,
  viewSwitcherVariants,
  viewSwitcherItemVariants,
  miniCalendarStyles,
  calendarAnimations,
  responsiveCalendarStyles,
  calendarZIndex,
  eventColorPalette
} from './calendar.styles'

// 型定義のみ保持（統合オブジェクトは循環参照を避けるため削除）
export type ButtonStylesType = {
  variants: typeof buttonVariants
  danger: typeof dangerButtonVariants
  states: typeof buttonStates
  icon: typeof iconButtonStyles
  group: typeof buttonGroupStyles
}

export type FormStylesType = {
  states: typeof formElementStates
  input: typeof inputVariants
  select: typeof selectVariants
  checkbox: typeof checkboxVariants
  radio: typeof radioVariants
  switch: typeof switchVariants
  textarea: typeof textareaVariants
  label: typeof labelVariants
  group: typeof formGroupStyles
  special: typeof specialFormStyles
  validation: typeof validationStyles
}

export type CardStylesType = {
  variants: typeof cardVariants
  header: typeof cardHeaderVariants
  title: typeof cardTitleVariants
  description: typeof cardDescriptionVariants
  action: typeof cardActionVariants
  content: typeof cardContentVariants
  footer: typeof cardFooterVariants
  special: typeof specialCardStyles
  layout: typeof cardLayoutStyles
  spacing: typeof cardSpacing
}

export type CalendarStylesType = {
  event: typeof eventBlockVariants
  currentTime: typeof currentTimeLineStyles
  grid: typeof gridLineStyles
  timeColumn: typeof timeColumnStyles
  dateHeader: typeof dateHeaderVariants
  layout: typeof calendarLayoutStyles
  viewSwitcher: typeof viewSwitcherVariants
  viewSwitcherItem: typeof viewSwitcherItemVariants
  miniCalendar: typeof miniCalendarStyles
  animations: typeof calendarAnimations
  responsive: typeof responsiveCalendarStyles
  zIndex: typeof calendarZIndex
  colors: typeof eventColorPalette
}