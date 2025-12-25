/**
 * StatusBar コンポーネント群
 *
 * Cursor/VS Code風の画面下部固定ステータスバー
 *
 * @example
 * ```tsx
 * import { StatusBar, StatusBarItem } from '@/components/layout/status-bar'
 *
 * <StatusBar>
 *   <StatusBar.Left>
 *     <StatusBarItem icon={<Calendar />} label="予定なし" onClick={...} />
 *   </StatusBar.Left>
 *   <StatusBar.Right>
 *     <StatusBarItem icon={<Dna />} label="ピーク時間帯" onClick={...} />
 *   </StatusBar.Right>
 * </StatusBar>
 * ```
 */
export { StatusBar } from './StatusBar';
export { StatusBarItem } from './StatusBarItem';

// アイテムコンポーネント
export { ChronotypeStatusItem } from './items/ChronotypeStatusItem';
export { ScheduleStatusItem } from './items/ScheduleStatusItem';
