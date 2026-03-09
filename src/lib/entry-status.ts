/**
 * エントリの時間位置ベースの状態判定
 *
 * 「Time waits for no one」原則:
 * ステータスを手動管理せず、時間位置から自動判定する。
 * - upcoming: 未来の予定（リマインダー有効、編集自由）
 * - active: 現在進行中（時間調整可）
 * - past: 過去の記録（充実度入力可、自動確定）
 */

import type { EntryOrigin } from '@/core/types/entry';

type EntryLike = {
  start_time: string | null;
  end_time: string | null;
};

export type EntryState = 'upcoming' | 'active' | 'past';

/**
 * エントリの時間位置から状態を判定
 *
 * @param entry - start_time, end_time を持つオブジェクト
 * @param now - 現在時刻（テスト用にオーバーライド可能）
 * @returns 'upcoming' | 'active' | 'past'
 */
export function getEntryState(entry: EntryLike, now?: Date): EntryState {
  const currentTime = now ?? new Date();

  if (!entry.start_time || !entry.end_time) {
    return 'upcoming';
  }

  const startTime = new Date(entry.start_time);
  const endTime = new Date(entry.end_time);

  if (startTime > currentTime) {
    return 'upcoming';
  }

  if (endTime > currentTime) {
    return 'active';
  }

  return 'past';
}

/**
 * エントリが過去かどうかを判定
 */
export function isEntryPast(entry: EntryLike, now?: Date): boolean {
  return getEntryState(entry, now) === 'past';
}

/**
 * 指定時刻が過去かどうかを判定（エントリ作成時の origin 判定用）
 */
export function isTimePast(time: string | Date, now?: Date): boolean {
  const currentTime = now ?? new Date();
  const targetTime = typeof time === 'string' ? new Date(time) : time;
  return targetTime < currentTime;
}

/**
 * ドラッグ移動時の origin 自動遷移を計算
 *
 * unplanned エントリが未来に移動された場合のみ planned に遷移し、
 * 記録系フィールド（actual_start/end, fulfillment_score）をクリアする。
 * planned エントリは移動先に関わらず planned のまま。
 */
export function computeOriginTransition(
  currentOrigin: EntryOrigin,
  newStartTime: Date,
  newEndTime: Date,
): { origin: EntryOrigin; clearFields: Record<string, null> | null } {
  if (currentOrigin === 'planned') {
    return { origin: 'planned', clearFields: null };
  }

  const newState = getEntryState({
    start_time: newStartTime.toISOString(),
    end_time: newEndTime.toISOString(),
  });

  if (newState === 'upcoming' || newState === 'active') {
    return {
      origin: 'planned',
      clearFields: {
        actual_start_time: null,
        actual_end_time: null,
        fulfillment_score: null,
      },
    };
  }

  return { origin: 'unplanned', clearFields: null };
}
