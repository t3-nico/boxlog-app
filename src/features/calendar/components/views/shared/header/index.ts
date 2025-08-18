// ヘッダー関連の共有コンポーネント（ビュー専用）
export { DateHeader } from './DateHeader'

// ページ全体のヘッダー機能は layout/Header/ を使用
export { ViewSwitcher } from '../../../layout/Header/ViewSwitcher'
export type { ViewOption } from '../../../layout/Header/ViewSwitcher'
export { DateNavigator, CompactDateNavigator } from '../../../layout/Header/DateNavigator'
export type { NavigationDirection } from '../../../layout/Header/DateNavigator'
export { DateRangeDisplay, CompactDateDisplay } from '../../../layout/Header/DateRangeDisplay'