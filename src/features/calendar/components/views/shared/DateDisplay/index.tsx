// DateDisplay コンポーネント群
export { DateDisplay } from './DateDisplay'
export { DateDisplayRow } from './DateDisplayRow'
export { DayDisplay } from './DayDisplay'

// 型定義
export type * from './DateDisplay.types'

// ヘッダー関連の共有コンポーネント（ビュー専用）
// ページ全体のヘッダー機能は layout/Header/ を使用
export { CompactDateNavigator, DateNavigator } from '../../../layout/Header/DateNavigator'
export type { NavigationDirection } from '../../../layout/Header/DateNavigator'
export { CompactDateDisplay, DateRangeDisplay } from '../../../layout/Header/DateRangeDisplay'
export { ViewSwitcher } from '../../../layout/Header/ViewSwitcher'
export type { ViewOption } from '../../../layout/Header/ViewSwitcher'
