/**
 * 繰り返しインスタンスID ユーティリティ
 *
 * CalendarEvent の合成ID（{parentEntryId}_{YYYY-MM-DD}）の
 * エンコード・デコードを型安全に行う。
 */

/** getInstanceRef が必要とする最小フィールド */
export interface InstanceRefSource {
  id: string;
  originalEntryId?: string | null | undefined;
  instanceDate?: string | null | undefined;
  calendarId?: string | null | undefined;
  startDate: Date | null | undefined;
}

export interface RecurrenceInstanceRef {
  parentEntryId: string;
  instanceDate: string; // YYYY-MM-DD
}

const SEPARATOR = '_';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 親エントリIDとインスタンス日付から合成IDを生成
 */
export function encodeInstanceId(parentEntryId: string, instanceDate: string): string {
  return `${parentEntryId}${SEPARATOR}${instanceDate}`;
}

/**
 * 合成IDから親エントリIDとインスタンス日付を復元
 * 合成IDでない場合は null を返す
 */
export function decodeInstanceId(compositeId: string): RecurrenceInstanceRef | null {
  const lastSepIndex = compositeId.lastIndexOf(SEPARATOR);
  if (lastSepIndex === -1) return null;

  const datePart = compositeId.slice(lastSepIndex + 1);
  if (!DATE_PATTERN.test(datePart)) return null;

  const parentEntryId = compositeId.slice(0, lastSepIndex);
  if (!parentEntryId) return null;

  return { parentEntryId, instanceDate: datePart };
}

/**
 * CalendarEvent からインスタンス情報を安全に取得
 *
 * 以下の優先順位で解決:
 * 1. originalEntryId + instanceDate（明示的フィールド）
 * 2. calendarId + ID末尾の日付パース（後方互換）
 * 3. calendarId + startDate（最終フォールバック）
 */
export function getInstanceRef(entry: InstanceRefSource): RecurrenceInstanceRef | null {
  // 1. 明示的フィールドから取得
  if (entry.originalEntryId && entry.instanceDate) {
    return {
      parentEntryId: entry.originalEntryId,
      instanceDate: entry.instanceDate,
    };
  }

  // 2. 合成IDからデコード
  const decoded = decodeInstanceId(entry.id);
  if (decoded) {
    return {
      parentEntryId: entry.calendarId || decoded.parentEntryId,
      instanceDate: decoded.instanceDate,
    };
  }

  // 3. calendarId + startDate フォールバック
  const parentId = entry.calendarId || entry.originalEntryId;
  if (parentId && entry.startDate) {
    return {
      parentEntryId: parentId,
      instanceDate: entry.startDate.toISOString().slice(0, 10),
    };
  }

  return null;
}
