/**
 * 時間制約エンジン — "Time waits for no one"
 *
 * エントリの状態（upcoming/active/past）は時間位置から自動判定。
 * @/lib/entry-status からの re-export で、engine 層からアクセス可能にする。
 */

export {
  computeOriginTransition,
  getEntryState,
  isEntryPast,
  isTimePast,
} from '@/lib/entry-status';

export type { EntryState } from '@/lib/entry-status';
