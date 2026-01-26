/**
 * 日付ユーティリティ（タイムゾーン問題の回避）
 *
 * **背景**:
 * - `new Date('YYYY-MM-DD')` はUTCとして解釈される（ISO 8601仕様）
 * - 日本時間（UTC+9）では前日になることがある
 * - 例: `new Date('2025-01-22')` → 2025-01-21T15:00:00.000Z （日本時間では22日0時のつもりが21日になる）
 *
 * **解決策**:
 * - YYYY-MM-DD文字列をローカルタイムゾーンの日付として解釈
 * - Date(year, month, day) コンストラクタを使用（月は0始まり）
 */

import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * YYYY-MM-DD文字列をローカルタイムゾーンのDateオブジェクトに変換
 *
 * @param dateString - YYYY-MM-DD形式の日付文字列
 * @returns ローカルタイムゾーンのDateオブジェクト（時刻は00:00:00）
 *
 * @example
 * ```typescript
 * const date = parseDateString('2025-01-22')
 * // 日本時間: 2025-01-22 00:00:00（前日にならない）
 * ```
 */
export function parseDateString(dateString: string): Date {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD.`);
  }

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10) - 1; // 0始まり
  const day = parseInt(dayStr!, 10);

  return new Date(year, month, day);
}

/**
 * YYYY-MM-DD文字列を yyyy/MM/dd 形式にフォーマット
 *
 * @param dateString - YYYY-MM-DD形式の日付文字列
 * @returns yyyy/MM/dd形式の文字列
 *
 * @example
 * ```typescript
 * formatDateString('2025-01-22') // '2025/01/22'
 * ```
 */
export function formatDateString(dateString: string): string {
  return dateString.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1/$2/$3');
}

/**
 * ISO 8601 datetime文字列を指定タイムゾーンのDateオブジェクトに変換
 *
 * @param datetimeString - ISO 8601形式の日時文字列（タイムゾーン付き・なし両対応）
 * @param targetTimezone - 変換先のタイムゾーン（例: 'Asia/Tokyo', 'America/New_York'）。省略時はブラウザのローカルタイムゾーン
 * @returns 指定タイムゾーンのDateオブジェクト
 *
 * @example
 * ```typescript
 * // タイムゾーンなし
 * const date1 = parseDatetimeString('2025-01-22T14:30:00')
 * // ブラウザのローカルタイムゾーンで解釈: 2025-01-22 14:30:00
 *
 * // タイムゾーン付き（Supabaseから返される形式）
 * const date2 = parseDatetimeString('2025-11-20T10:00:00+00:00', 'Asia/Tokyo')
 * // UTC 10:00 → JST 19:00 として解釈
 * ```
 */
export function parseDatetimeString(datetimeString: string, _targetTimezone?: string): Date {
  // タイムゾーン付きの形式（YYYY-MM-DDTHH:mm:ss±HH:MM または YYYY-MM-DDTHH:mm:ss.sss±HH:MM）
  if (
    datetimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)$/)
  ) {
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid datetime: ${datetimeString}`);
    }

    // targetTimezoneが指定されている場合、そのタイムゾーンでの表示時刻を返す
    // ただし、Dateオブジェクトは内部的にはUTCタイムスタンプを保持するため、
    // ここでは変換せず、表示時にタイムゾーンを考慮する
    // （注: date-fns-tzを使う場合は後で実装）
    return date;
  }

  // タイムゾーンなしの形式（YYYY-MM-DDTHH:mm:ss）
  const match = datetimeString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(
      `Invalid datetime format: ${datetimeString}. Expected YYYY-MM-DDTHH:mm:ss or ISO 8601 with timezone.`,
    );
  }

  const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = match;
  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10) - 1; // 0始まり
  const day = parseInt(dayStr!, 10);
  const hour = parseInt(hourStr!, 10);
  const minute = parseInt(minuteStr!, 10);
  const second = parseInt(secondStr!, 10);

  // targetTimezoneが指定されている場合は、そのタイムゾーンの時刻として解釈
  // ただし、現在の実装ではローカルタイムゾーンとして解釈
  // （注: date-fns-tzを使う完全な実装は後で追加）
  return new Date(year, month, day, hour, minute, second);
}

/**
 * ISO 8601 datetime文字列をユーザーのタイムゾーンで解釈したDateオブジェクトに変換
 *
 * **重要**: この関数は「表示用」の時刻を返す。
 * 返されたDateオブジェクトの getHours() 等は、指定タイムゾーンでの時刻を返す。
 *
 * @param isoString - ISO 8601形式の日時文字列（例: "2025-01-22T14:30:00+09:00" or "2025-01-22T05:30:00Z"）
 * @param timezone - ユーザーのタイムゾーン（例: 'Asia/Tokyo'）
 * @returns ユーザーのタイムゾーンで解釈されたDateオブジェクト
 *
 * @example
 * ```typescript
 * // UTCの05:30をJSTで表示
 * const date = parseISOToUserTimezone('2025-01-22T05:30:00Z', 'Asia/Tokyo');
 * date.getHours() // => 14 (JST 14:30)
 * ```
 */
export function parseISOToUserTimezone(isoString: string, timezone: string): Date {
  const utcDate = new Date(isoString);
  if (isNaN(utcDate.getTime())) {
    throw new Error(`Invalid ISO datetime: ${isoString}`);
  }
  // UTCからユーザーのタイムゾーンに変換
  return toZonedTime(utcDate, timezone);
}

/**
 * ユーザーのタイムゾーンの時刻をUTC ISO文字列に変換
 *
 * **重要**: この関数は「保存用」のISO文字列を返す。
 *
 * @param localDate - ユーザーのタイムゾーンでの日付
 * @param hours - 時（0-23）
 * @param minutes - 分（0-59）
 * @param timezone - ユーザーのタイムゾーン（例: 'Asia/Tokyo'）
 * @returns UTC ISO 8601文字列（例: "2025-01-22T05:30:00.000Z"）
 *
 * @example
 * ```typescript
 * // JST 14:30 をUTC ISO文字列に変換
 * const iso = localTimeToUTCISO(new Date(2025, 0, 22), 14, 30, 'Asia/Tokyo');
 * // => "2025-01-22T05:30:00.000Z"
 * ```
 */
export function localTimeToUTCISO(
  localDate: Date,
  hours: number,
  minutes: number,
  timezone: string,
): string {
  // ローカル日付から年月日を取得
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();

  // ユーザーのタイムゾーンでの時刻として新しいDateを作成
  const zonedDate = new Date(year, month, day, hours, minutes, 0, 0);

  // ユーザーのタイムゾーンからUTCに変換
  const utcDate = fromZonedTime(zonedDate, timezone);

  return utcDate.toISOString();
}
