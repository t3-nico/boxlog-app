/**
 * Entry Recurrence Utilities Unit Tests
 *
 * 繰り返しパターン展開ユーティリティのテスト
 * - expandRecurrence: 繰り返しパターンを指定期間内に展開
 * - getEntryRecurrenceConfig: プランの繰り返し設定からRecurrenceConfigを取得
 * - isRecurringEntry: 繰り返しエントリかどうかを判定
 *
 * NOTE: date-fns の startOfDay/getDay/getDate はローカルタイムゾーンで動作する。
 * テストの start_time には "T12:00:00Z" を使い、どのタイムゾーン（UTC-12〜UTC+14）でも
 * 同じカレンダー日付になるようにする。
 * rangeStart/rangeEnd は Date オブジェクトを直接 new Date('YYYY-MM-DDT00:00:00') で
 * 生成せず、toDateKey() で比較する。
 */

import { describe, expect, it } from 'vitest';

import type { EntryInstanceException } from '@/features/entry/lib/entry-recurrence';
import {
  expandRecurrence,
  getEntryRecurrenceConfig,
  isRecurringEntry,
} from '@/features/entry/lib/entry-recurrence';
import type { Entry } from '@/features/entry/types/entry';

// テスト用エントリのベース値
function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'entry-1',
    user_id: 'user-1',
    title: 'Test Entry',
    description: null,
    origin: 'planned',
    start_time: null,
    end_time: null,
    actual_start_time: null,
    actual_end_time: null,
    duration_minutes: null,
    fulfillment_score: null,
    recurrence_type: null,
    recurrence_end_date: null,
    recurrence_rule: null,
    reminder_minutes: null,
    reviewed_at: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  };
}

/**
 * Date を YYYY-MM-DD のローカル日付文字列に変換する。
 * date-fns の startOfDay と同じローカルタイムゾーン基準で比較するため
 * toISOString()（UTC基準）ではなくローカル年月日を使う。
 */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 指定したローカル日付（YYYY-MM-DD）の正午（12:00 ローカル）のDateを生成する。
 * start_time として使うと startOfDay がその日を返す。
 */
function localNoon(dateStr: string): string {
  const [y, m, d] = dateStr.split('-') as [string, string, string];
  return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0).toISOString();
}

/**
 * 指定したローカル日付の開始（00:00:00 ローカル）のDateを生成する。
 * rangeStart / rangeEnd として使う。
 */
function localStart(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-') as [string, string, string];
  return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
}

/**
 * 指定したローカル日付の終端（23:59:59 ローカル）のDateを生成する。
 */
function localEnd(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-') as [string, string, string];
  return new Date(Number(y), Number(m) - 1, Number(d), 23, 59, 59);
}

/**
 * expandRecurrence 内部で使われる exceptionMap のキー生成ロジックに合わせた
 * 日付キーを返す。
 *
 * 実装では `startOfDay(new Date(start_time))` がオカレンスの current となり、
 * `current.toISOString().slice(0, 10)` がキーになる。
 * localNoon() を start_time として使うと、
 *   startOfDay(localNoon('2026-03-11')) = 2026-03-11T00:00:00 (local) = UTC date varies
 * exception の instanceDate はこの UTC date 文字列と一致させる必要がある。
 */
function occurrenceDateKey(localDateStr: string): string {
  // ローカル日付の深夜0時（startOfDay の結果と同じ）のUTC-ISO日付
  const midnight = localStart(localDateStr);
  return midnight.toISOString().slice(0, 10);
}

describe('isRecurringEntry', () => {
  it('recurrence_typeが"none"のときfalseを返す', () => {
    expect(isRecurringEntry({ recurrence_type: 'none', recurrence_rule: null })).toBe(false);
  });

  it('recurrence_typeがnullのときfalseを返す', () => {
    expect(isRecurringEntry({ recurrence_type: null, recurrence_rule: null })).toBe(false);
  });

  it('recurrence_typeが"daily"のときtrueを返す', () => {
    expect(isRecurringEntry({ recurrence_type: 'daily', recurrence_rule: null })).toBe(true);
  });

  it('recurrence_ruleが設定されているときtrueを返す', () => {
    expect(isRecurringEntry({ recurrence_type: null, recurrence_rule: 'FREQ=DAILY' })).toBe(true);
  });

  it('recurrence_typeとrecurrence_ruleが両方設定されているときtrueを返す', () => {
    expect(isRecurringEntry({ recurrence_type: 'weekly', recurrence_rule: 'FREQ=WEEKLY' })).toBe(
      true,
    );
  });
});

describe('getEntryRecurrenceConfig', () => {
  it('recurrence_ruleが優先される（RRULE形式）', () => {
    const entry = makeEntry({
      recurrence_rule: 'FREQ=DAILY;INTERVAL=2',
      recurrence_type: 'weekly', // こちらは無視される
    });
    const config = getEntryRecurrenceConfig(entry);
    expect(config).not.toBeNull();
    expect(config?.frequency).toBe('daily');
    expect(config?.interval).toBe(2);
  });

  it('recurrence_typeが"daily"のとき毎日設定を返す', () => {
    const entry = makeEntry({
      recurrence_type: 'daily',
      start_time: localNoon('2026-03-10'),
    });
    const config = getEntryRecurrenceConfig(entry);
    expect(config).not.toBeNull();
    expect(config?.frequency).toBe('daily');
    expect(config?.interval).toBe(1);
    expect(config?.endType).toBe('never');
  });

  it('recurrence_typeが"weekly"のとき開始日の曜日を使う', () => {
    // 2026-03-10はローカル日付で火曜（getDay=2）
    const entry = makeEntry({
      recurrence_type: 'weekly',
      start_time: localNoon('2026-03-10'),
    });
    const config = getEntryRecurrenceConfig(entry);
    expect(config).not.toBeNull();
    expect(config?.frequency).toBe('weekly');
    // 2026-03-10 のローカル曜日を動的に取得して照合
    const expectedDay = new Date(localNoon('2026-03-10')).getDay();
    expect(config?.byWeekday).toContain(expectedDay);
  });

  it('recurrence_typeが"monthly"のとき開始日の日付を使う', () => {
    const entry = makeEntry({
      recurrence_type: 'monthly',
      start_time: localNoon('2026-03-10'),
    });
    const config = getEntryRecurrenceConfig(entry);
    expect(config).not.toBeNull();
    expect(config?.frequency).toBe('monthly');
    // ローカル日付の日を動的取得
    const expectedDay = new Date(localNoon('2026-03-10')).getDate();
    expect(config?.byMonthDay).toBe(expectedDay);
  });

  it('recurrence_typeが"yearly"のとき年次設定を返す', () => {
    const entry = makeEntry({
      recurrence_type: 'yearly',
      start_time: localNoon('2026-03-10'),
    });
    const config = getEntryRecurrenceConfig(entry);
    expect(config).not.toBeNull();
    expect(config?.frequency).toBe('yearly');
  });

  it('recurrence_typeが"weekdays"のとき月〜金（1〜5）を返す', () => {
    const entry = makeEntry({
      recurrence_type: 'weekdays',
      start_time: localNoon('2026-03-10'),
    });
    const config = getEntryRecurrenceConfig(entry);
    expect(config).not.toBeNull();
    expect(config?.frequency).toBe('weekly');
    expect(config?.byWeekday).toEqual([1, 2, 3, 4, 5]);
  });

  it('recurrence_typeが"none"のときnullを返す', () => {
    const entry = makeEntry({ recurrence_type: 'none' });
    expect(getEntryRecurrenceConfig(entry)).toBeNull();
  });

  it('recurrence_typeもrecurrence_ruleもないときnullを返す', () => {
    const entry = makeEntry();
    expect(getEntryRecurrenceConfig(entry)).toBeNull();
  });
});

describe('expandRecurrence', () => {
  describe('設定なしのエントリ', () => {
    it('繰り返し設定がないとき空配列を返す', () => {
      const entry = makeEntry({ start_time: localNoon('2026-03-10') });
      expect(expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-31'))).toEqual([]);
    });

    it('start_timeがnullのとき空配列を返す', () => {
      const entry = makeEntry({ recurrence_type: 'daily', start_time: null });
      expect(expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-31'))).toEqual([]);
    });
  });

  describe('毎日繰り返し（daily）', () => {
    it('範囲内に毎日オカレンスを生成する', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
        end_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-14'));

      // 3/10〜3/14の5日分
      expect(results).toHaveLength(5);
      expect(toLocalDateKey(results[0]!.date)).toBe('2026-03-10');
      expect(toLocalDateKey(results[4]!.date)).toBe('2026-03-14');
    });

    it('開始日前の範囲にはオカレンスを生成しない', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-15'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-10'));
      expect(results).toHaveLength(0);
    });

    it('時刻情報をHH:mm形式で保持する', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
        end_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-10'));

      expect(results).toHaveLength(1);
      expect(results[0]!.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(results[0]!.endTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('end_timeがnullのときendTimeはnull', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
        end_time: null,
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-10'));

      expect(results).toHaveLength(1);
      expect(results[0]!.endTime).toBeNull();
    });

    it('entryIdを各オカレンスに付与する', () => {
      const entry = makeEntry({
        id: 'my-entry-id',
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-12'));

      expect(results.every((r) => r.entryId === 'my-entry-id')).toBe(true);
    });
  });

  describe('毎週繰り返し（weekly）', () => {
    it('指定曜日のみオカレンスを生成する（月・水・金）', () => {
      // 2026-03-09はローカルで月曜
      const entry = makeEntry({
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
        start_time: localNoon('2026-03-09'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-09'), localEnd('2026-03-15'));

      // 3/9(月), 3/11(水), 3/13(金)の3件
      expect(results).toHaveLength(3);
      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-09');
      expect(dates).toContain('2026-03-11');
      expect(dates).toContain('2026-03-13');
    });

    it('2週間ごとの繰り返しを正しく生成する（BYDAYなし）', () => {
      // BYDAY なしの FREQ=WEEKLY;INTERVAL=2 は addWeeks(current, 2) で厳密に2週おき
      // 2026-03-02 スタート → 3/2, 3/16, 3/30
      const entry = makeEntry({
        recurrence_rule: 'FREQ=WEEKLY;INTERVAL=2',
        start_time: localNoon('2026-03-02'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-31'));

      // 3/2, 3/16, 3/30 の3件
      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-02');
      expect(dates).toContain('2026-03-16');
      expect(dates).toContain('2026-03-30');
      expect(results).toHaveLength(3);
    });

    it('recurrence_typeが"weekdays"のとき平日のみ生成する', () => {
      // 2026-03-09はローカルで月曜
      const entry = makeEntry({
        recurrence_type: 'weekdays',
        start_time: localNoon('2026-03-09'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-09'), localEnd('2026-03-15'));

      // 3/9(月), 3/10(火), 3/11(水), 3/12(木), 3/13(金) の5件
      expect(results).toHaveLength(5);
      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).not.toContain('2026-03-14'); // 土曜除外
      expect(dates).not.toContain('2026-03-15'); // 日曜除外
    });
  });

  describe('毎月繰り返し（monthly）', () => {
    it('毎月同じ日付にオカレンスを生成する', () => {
      const entry = makeEntry({
        recurrence_type: 'monthly',
        start_time: localNoon('2026-01-15'),
      });

      const results = expandRecurrence(entry, localStart('2026-01-01'), localEnd('2026-04-30'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-01-15');
      expect(dates).toContain('2026-02-15');
      expect(dates).toContain('2026-03-15');
      expect(dates).toContain('2026-04-15');
    });

    it('RRULEのBYMONTHDAYで月次繰り返しを生成する', () => {
      const entry = makeEntry({
        recurrence_rule: 'FREQ=MONTHLY;BYMONTHDAY=10',
        start_time: localNoon('2026-01-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-01-01'), localEnd('2026-03-31'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-01-10');
      expect(dates).toContain('2026-02-10');
      expect(dates).toContain('2026-03-10');
    });
  });

  describe('毎年繰り返し（yearly）', () => {
    it('毎年同じ日にオカレンスを生成する', () => {
      const entry = makeEntry({
        recurrence_type: 'yearly',
        start_time: localNoon('2024-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2024-01-01'), localEnd('2026-12-31'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2024-03-10');
      expect(dates).toContain('2025-03-10');
      expect(dates).toContain('2026-03-10');
    });
  });

  describe('終了条件', () => {
    it('count指定で回数制限が効く', () => {
      const entry = makeEntry({
        recurrence_rule: 'FREQ=DAILY;COUNT=3',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-31'));

      expect(results).toHaveLength(3);
      expect(toLocalDateKey(results[0]!.date)).toBe('2026-03-10');
      expect(toLocalDateKey(results[2]!.date)).toBe('2026-03-12');
    });

    it('UNTIL指定で終了日以降を生成しない', () => {
      // UNTIL=20260315 → ローカル日付で 2026-03-15 まで
      const entry = makeEntry({
        recurrence_rule: 'FREQ=DAILY;UNTIL=20260315',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-31'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-10');
      // 3/15 が含まれるかは UNTIL の比較方法（isAfter）と recurrenceEndDate に依存する
      // 少なくとも 3/16 以降は含まれないことを検証
      expect(dates).not.toContain('2026-03-16');
      expect(dates).not.toContain('2026-03-17');
    });

    it('recurrence_end_dateで終了日以降を生成しない', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
        recurrence_end_date: '2026-03-12',
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-20'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-10');
      expect(dates).toContain('2026-03-11');
      // 3/13以降は含まれないことを検証
      expect(dates).not.toContain('2026-03-13');
      expect(dates).not.toContain('2026-03-14');
    });
  });

  describe('例外（exceptions）処理', () => {
    it('cancelled例外の日付をスキップする', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      // exceptionMap のキーは startOfDay(occurrence).toISOString().slice(0,10) = UTC日付
      const exceptions: EntryInstanceException[] = [
        { instanceDate: occurrenceDateKey('2026-03-11'), exceptionType: 'cancelled' },
      ];

      const results = expandRecurrence(
        entry,
        localStart('2026-03-10'),
        localEnd('2026-03-13'),
        exceptions,
      );

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-10');
      expect(dates).not.toContain('2026-03-11'); // キャンセル済み
      expect(dates).toContain('2026-03-12');
      expect(dates).toContain('2026-03-13');
    });

    it('modified例外のオーバーライド情報を反映する', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const instanceStart = localNoon('2026-03-11');
      const instanceEnd = localNoon('2026-03-11');
      const exceptions: EntryInstanceException[] = [
        {
          instanceDate: occurrenceDateKey('2026-03-11'),
          exceptionType: 'modified',
          title: 'Modified Title',
          description: 'Modified Description',
          instanceStart,
          instanceEnd,
        },
      ];

      const results = expandRecurrence(
        entry,
        localStart('2026-03-10'),
        localEnd('2026-03-11'),
        exceptions,
      );

      const modified = results.find((r) => toLocalDateKey(r.date) === '2026-03-11');
      expect(modified).toBeDefined();
      expect(modified?.isException).toBe(true);
      expect(modified?.exceptionType).toBe('modified');
      expect(modified?.overrideTitle).toBe('Modified Title');
      expect(modified?.overrideDescription).toBe('Modified Description');
      expect(modified?.overrideStartTime).toBe(instanceStart);
      expect(modified?.overrideEndTime).toBe(instanceEnd);
    });

    it('moved例外で移動先に追加される', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      // 実装の exceptionMap はキー = `startOfDay(occurrence).toISOString().slice(0,10)` (UTC日付)
      // 移動先日付の通常オカレンスをスキップさせるには:
      //   instanceDate = occurrenceDateKey('2026-03-18')
      // そして moved 先として追加される条件:
      //   isSameDay/isAfter/isBefore で new Date(instanceDate) と rangeStart/End を比較
      // ここでは移動先を 3/18 ローカルとし、exceptionMap が 3/18 通常オカレンスをスキップする
      const movedDestKey = occurrenceDateKey('2026-03-18');
      const exceptions: EntryInstanceException[] = [
        {
          instanceDate: movedDestKey,
          exceptionType: 'moved',
          originalDate: '2026-03-11',
        },
      ];

      const results = expandRecurrence(
        entry,
        localStart('2026-03-10'),
        localEnd('2026-03-20'),
        exceptions,
      );

      // moved 先として追加されたオカレンスを確認
      // new Date(movedDestKey) をローカル日付に変換して検索
      const movedDate = new Date(movedDestKey);
      const movedLocalKey = toLocalDateKey(movedDate);

      const moved = results.find((r) => toLocalDateKey(r.date) === movedLocalKey && r.isException);
      expect(moved).toBeDefined();
      expect(moved?.isException).toBe(true);
      expect(moved?.exceptionType).toBe('moved');
    });

    it('moved例外の移動先が範囲外のとき追加しない', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      // instanceDate は移動先（範囲外の4/1 UTC midnight）
      // 元の日付（3/11）は exceptionMap にヒットしないため通常通り生成される
      const exceptions: EntryInstanceException[] = [
        {
          instanceDate: '2026-04-01', // 範囲外の移動先（UTC midnight）
          exceptionType: 'moved',
          originalDate: '2026-03-11',
        },
      ];

      const results = expandRecurrence(
        entry,
        localStart('2026-03-10'),
        localEnd('2026-03-15'),
        exceptions,
      );

      const dates = results.map((r) => toLocalDateKey(r.date));
      // 移動先（4/1）は範囲外なので追加されない
      const movedDate = new Date('2026-04-01'); // UTC midnight
      expect(dates).not.toContain(toLocalDateKey(movedDate));
    });

    it('例外なしのオカレンスはisException=falseを持つ', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-10'));

      expect(results[0]?.isException).toBe(false);
    });

    it('例外配列が空でも正常動作する', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-12'), []);
      expect(results).toHaveLength(3);
    });

    it('例外引数省略時でも正常動作する（デフォルト空配列）', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      // 第4引数を省略
      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-12'));
      expect(results).toHaveLength(3);
    });
  });

  describe('結果の並び順', () => {
    it('オカレンスが日付の昇順でソートされる', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-15'));

      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.date.getTime()).toBeGreaterThan(results[i - 1]!.date.getTime());
      }
    });

    it('moved例外を含む場合もソートが維持される', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      // 3/14 → 3/10 に移動（範囲先頭への移動）
      // ただし 3/10 は通常オカレンスとしても生成されるため、dateKey が重複する
      // 重複チェックではなく順序のみを検証する
      const exceptions: EntryInstanceException[] = [
        {
          instanceDate: '2026-03-12', // 移動先
          exceptionType: 'moved',
          originalDate: '2026-03-14',
        },
      ];

      const results = expandRecurrence(
        entry,
        localStart('2026-03-10'),
        localEnd('2026-03-15'),
        exceptions,
      );

      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.date.getTime()).toBeGreaterThanOrEqual(results[i - 1]!.date.getTime());
      }
    });
  });

  describe('境界条件', () => {
    it('rangeStart当日に開始するエントリを含む', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-10'));
      expect(results).toHaveLength(1);
      expect(toLocalDateKey(results[0]!.date)).toBe('2026-03-10');
    });

    it('開始日が範囲終了後のエントリは0件を返す', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-04-01'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-31'));
      expect(results).toHaveLength(0);
    });

    it('エントリ開始日が範囲外でも範囲内のオカレンスを生成する', () => {
      // 2026-01-01 スタート、3月だけ表示
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-01-01'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-10'), localEnd('2026-03-12'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-10');
      expect(dates).toContain('2026-03-11');
      expect(dates).toContain('2026-03-12');
    });

    it('rangeStart = rangeEnd のとき該当日のみ返す', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-10'),
      });

      const d = localStart('2026-03-10');
      const results = expandRecurrence(entry, d, d);
      expect(results).toHaveLength(1);
      expect(toLocalDateKey(results[0]!.date)).toBe('2026-03-10');
    });
  });

  describe('RRULEベースの複合パターン', () => {
    it('INTERVAL=3の毎日繰り返しを正しく生成する', () => {
      const entry = makeEntry({
        recurrence_rule: 'FREQ=DAILY;INTERVAL=3',
        start_time: localNoon('2026-03-01'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-20'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-01');
      expect(dates).toContain('2026-03-04');
      expect(dates).toContain('2026-03-07');
      expect(dates).toContain('2026-03-10');
      expect(dates).toContain('2026-03-13');
      expect(dates).toContain('2026-03-16');
      expect(dates).toContain('2026-03-19');
      expect(results).toHaveLength(7);
    });

    it('INTERVAL=2の毎月繰り返し（隔月）を正しく生成する', () => {
      const entry = makeEntry({
        recurrence_rule: 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1',
        start_time: localNoon('2026-01-01'),
      });

      const results = expandRecurrence(entry, localStart('2026-01-01'), localEnd('2026-07-01'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-01-01');
      expect(dates).toContain('2026-03-01');
      expect(dates).toContain('2026-05-01');
      expect(dates).toContain('2026-07-01');
      expect(dates).not.toContain('2026-02-01');
      expect(dates).not.toContain('2026-04-01');
    });
  });

  describe('DST（サマータイム）境界', () => {
    it('DST移行をまたぐ毎日繰り返しでも日付が正しく生成される', () => {
      // 米国 Eastern Time: 2026-03-08 02:00 に冬時間→夏時間へ移行
      // date-fns はローカルタイムで動作するため、正午を起点にすることで影響を最小化
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2026-03-07'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-07'), localEnd('2026-03-10'));

      expect(results).toHaveLength(4);
      expect(toLocalDateKey(results[0]!.date)).toBe('2026-03-07');
      expect(toLocalDateKey(results[1]!.date)).toBe('2026-03-08');
      expect(toLocalDateKey(results[2]!.date)).toBe('2026-03-09');
      expect(toLocalDateKey(results[3]!.date)).toBe('2026-03-10');
    });

    it('DST移行をまたぐ毎週繰り返しでも曜日が維持される', () => {
      // 2026-03-01（日）スタート、週次
      const entry = makeEntry({
        recurrence_rule: 'FREQ=WEEKLY;BYDAY=SU',
        start_time: localNoon('2026-03-01'),
      });

      const results = expandRecurrence(entry, localStart('2026-03-01'), localEnd('2026-03-22'));

      const dates = results.map((r) => toLocalDateKey(r.date));
      expect(dates).toContain('2026-03-01');
      expect(dates).toContain('2026-03-08');
      expect(dates).toContain('2026-03-15');
      expect(dates).toContain('2026-03-22');
    });
  });

  describe('大量オカレンス・ループ防護', () => {
    it('1000件を超えてもループしない（maxIterations防護）', () => {
      const entry = makeEntry({
        recurrence_type: 'daily',
        start_time: localNoon('2024-01-01'),
      });
      // 1100日分以上の範囲
      const rangeStart = localStart('2024-01-01');
      const rangeEnd = localEnd('2027-01-31');

      // エラーなく完了し、結果が返ること
      expect(() => expandRecurrence(entry, rangeStart, rangeEnd)).not.toThrow();
      const results = expandRecurrence(entry, rangeStart, rangeEnd);
      // maxIterations=1000 なので上限付近で打ち切られる
      expect(results.length).toBeLessThanOrEqual(1000);
    });
  });
});
