/**
 * タイムゾーン管理ユーティリティ
 * ユーザー設定とブラウザ自動検出に対応
 */

// サポートするタイムゾーンの定義
export const SUPPORTED_TIMEZONES = [
  { value: 'Asia/Tokyo', label: '日本 (JST)', offset: '+09:00' },
  { value: 'UTC', label: '協定世界時 (UTC)', offset: '+00:00' },
  { value: 'America/New_York', label: 'アメリカ東部 (EST/EDT)', offset: '-05:00/-04:00' },
  { value: 'America/Los_Angeles', label: 'アメリカ西部 (PST/PDT)', offset: '-08:00/-07:00' },
  { value: 'Europe/London', label: 'イギリス (GMT/BST)', offset: '+00:00/+01:00' },
  { value: 'Europe/Paris', label: 'ヨーロッパ中央 (CET/CEST)', offset: '+01:00/+02:00' },
  { value: 'Australia/Sydney', label: 'オーストラリア東部 (AEST/AEDT)', offset: '+10:00/+11:00' },
  { value: 'Asia/Shanghai', label: '中国 (CST)', offset: '+08:00' },
  { value: 'Asia/Seoul', label: '韓国 (KST)', offset: '+09:00' },
] as const;

export type TimezoneValue = typeof SUPPORTED_TIMEZONES[number]['value'];

/**
 * ブラウザから自動検出されたタイムゾーンを取得
 */
export const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('ブラウザのタイムゾーン検出に失敗:', error);
    return 'Asia/Tokyo'; // フォールバック
  }
};

/**
 * ローカルストレージからユーザーのタイムゾーン設定を取得
 */
export const getUserTimezone = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('user-timezone');
  } catch (error) {
    console.warn('ローカルストレージからタイムゾーン設定の取得に失敗:', error);
    return null;
  }
};

/**
 * タイムゾーン変更通知用のカスタムイベント
 */
const TIMEZONE_CHANGE_EVENT = 'timezone-change';

/**
 * ユーザーのタイムゾーン設定をローカルストレージに保存
 */
export const setUserTimezone = (timezone: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user-timezone', timezone);
    console.log('タイムゾーン設定を保存:', timezone);
    
    // タイムゾーン変更を他のコンポーネントに通知
    window.dispatchEvent(new CustomEvent(TIMEZONE_CHANGE_EVENT, { detail: { timezone } }));
  } catch (error) {
    console.error('タイムゾーン設定の保存に失敗:', error);
  }
};

/**
 * タイムゾーン変更通知をリッスンするためのユーティリティ関数
 */
export const listenToTimezoneChange = (callback: (timezone: string) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleTimezoneChange = (event: CustomEvent) => {
    callback(event.detail.timezone);
  };
  
  window.addEventListener(TIMEZONE_CHANGE_EVENT, handleTimezoneChange as EventListener);
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener(TIMEZONE_CHANGE_EVENT, handleTimezoneChange as EventListener);
  };
};

/**
 * 現在使用すべきタイムゾーンを取得
 * 優先順位: 1. ユーザー設定 > 2. ブラウザ自動検出
 */
export const getCurrentTimezone = (): string => {
  const userTimezone = getUserTimezone();
  if (userTimezone) {
    console.log('ユーザー設定のタイムゾーンを使用:', userTimezone);
    return userTimezone;
  }
  
  const browserTimezone = getBrowserTimezone();
  console.log('ブラウザ検出のタイムゾーンを使用:', browserTimezone);
  return browserTimezone;
};

/**
 * タイムゾーンのオフセット（分）を取得
 * UTC+9 = 540分 (JSTの場合)
 */
export const getTimezoneOffset = (timezone: string): number => {
  try {
    // UTCの場合は0を返す
    if (timezone === 'UTC') {
      console.log(`タイムゾーン ${timezone} のオフセット: 0分`);
      return 0;
    }
    
    // Intl.DateTimeFormat APIを使用してオフセットを正確に計算
    const now = new Date();
    
    // UTC時刻での各部分を取得
    const utcFormatter = new Intl.DateTimeFormat('en', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // 対象タイムゾーンでの各部分を取得
    const targetFormatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const utcParts = utcFormatter.formatToParts(now);
    const targetParts = targetFormatter.formatToParts(now);
    
    // 年月日時分を取得
    const getPartValue = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parseInt(parts.find(p => p.type === type)?.value || '0');
    
    const utcYear = getPartValue(utcParts, 'year');
    const utcMonth = getPartValue(utcParts, 'month');
    const utcDay = getPartValue(utcParts, 'day');
    const utcHour = getPartValue(utcParts, 'hour');
    const utcMinute = getPartValue(utcParts, 'minute');
    
    const targetYear = getPartValue(targetParts, 'year');
    const targetMonth = getPartValue(targetParts, 'month');
    const targetDay = getPartValue(targetParts, 'day');
    const targetHour = getPartValue(targetParts, 'hour');
    const targetMinute = getPartValue(targetParts, 'minute');
    
    // UTC時刻とターゲット時刻のDateオブジェクトを作成
    const utcDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDay, utcHour, utcMinute));
    const targetDate = new Date(Date.UTC(targetYear, targetMonth - 1, targetDay, targetHour, targetMinute));
    
    // オフセットを分で計算
    const offsetMs = targetDate.getTime() - utcDate.getTime();
    const offsetMinutes = Math.round(offsetMs / 60000);
    
    console.log(`🌐 タイムゾーン ${timezone} のオフセット計算:`, {
      now: now.toISOString(),
      utc: `${utcYear}-${utcMonth.toString().padStart(2, '0')}-${utcDay.toString().padStart(2, '0')} ${utcHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')}`,
      target: `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${targetDay.toString().padStart(2, '0')} ${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`,
      offsetMinutes
    });
    
    return offsetMinutes;
  } catch (error) {
    console.error(`タイムゾーン ${timezone} のオフセット計算に失敗:`, error);
    // フォールバック: 既知のタイムゾーンの固定値
    const knownOffsets: { [key: string]: number } = {
      'Asia/Tokyo': 540,      // UTC+9
      'Asia/Seoul': 540,      // UTC+9
      'Asia/Shanghai': 480,   // UTC+8
      'Australia/Sydney': 600, // UTC+10 (標準時、サマータイム考慮なし)
      'Europe/London': 0,     // UTC+0 (標準時)
      'Europe/Paris': 60,     // UTC+1 (標準時)
      'America/New_York': -300, // UTC-5 (標準時)
      'America/Los_Angeles': -480, // UTC-8 (標準時)
      'UTC': 0
    };
    
    return knownOffsets[timezone] || 0;
  }
};

/**
 * UTC時間をユーザーのタイムゾーンに変換（最適化版）
 */
export const utcToUserTimezone = (utcDate: Date): Date => {
  const timezone = getCurrentTimezone();
  
  // UTCの場合はそのまま返す
  if (timezone === 'UTC') {
    return new Date(utcDate);
  }
  
  // UTC時刻を指定タイムゾーンの各部分に分解
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(utcDate);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    const year = parseInt(getValue('year'));
    const month = parseInt(getValue('month')) - 1; // Date constructor expects 0-based month
    const day = parseInt(getValue('day'));
    const hour = parseInt(getValue('hour'));
    const minute = parseInt(getValue('minute'));
    const second = parseInt(getValue('second'));
    
    // ローカル時刻として作成（変換済み）
    const convertedDate = new Date(year, month, day, hour, minute, second);
    
    return convertedDate;
  } catch (error) {
    console.error(`UTC→タイムゾーン変換エラー (${timezone}):`, error);
    // フォールバック: 元の日付をそのまま返す
    return new Date(utcDate);
  }
};

/**
 * ユーザーのタイムゾーンの時間をUTCに変換（最適化版）
 */
export const userTimezoneToUtc = (localDate: Date): Date => {
  const timezone = getCurrentTimezone();
  
  // UTCの場合はそのまま返す
  if (timezone === 'UTC') {
    console.log('UTC → UTC変換（変換なし）:', {
      timezone,
      local: localDate.toISOString(),
      result: localDate.toISOString()
    });
    return new Date(localDate);
  }
  
  // ローカル日時の各部分を取得
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();
  const hour = localDate.getHours();
  const minute = localDate.getMinutes();
  const second = localDate.getSeconds();
  const millisecond = localDate.getMilliseconds();
  
  try {
    // 指定タイムゾーンでの同じ時刻を表すUTC時刻を逆算
    // まず仮のUTC時刻を作成
    const testUtc = new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
    
    // この仮UTC時刻を指定タイムゾーンで表示
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(testUtc);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    const displayYear = parseInt(getValue('year'));
    const displayMonth = parseInt(getValue('month')) - 1;
    const displayDay = parseInt(getValue('day'));
    const displayHour = parseInt(getValue('hour'));
    const displayMinute = parseInt(getValue('minute'));
    const displaySecond = parseInt(getValue('second'));
    
    // 表示される時刻と目標時刻の差分を計算
    const targetTime = new Date(year, month, day, hour, minute, second, millisecond).getTime();
    const displayTime = new Date(displayYear, displayMonth, displayDay, displayHour, displayMinute, displaySecond, millisecond).getTime();
    const diff = targetTime - displayTime;
    
    // 差分を適用してUTC時刻を調整
    const utcDate = new Date(testUtc.getTime() + diff);
    
    console.log('ユーザータイムゾーン → UTC変換（Intl API）:', {
      timezone,
      local: localDate.toISOString(),
      target: { year, month: month + 1, day, hour, minute, second },
      display: { year: displayYear, month: displayMonth + 1, day: displayDay, hour: displayHour, minute: displayMinute, second: displaySecond },
      diff: `${diff / 60000}分`,
      utc: utcDate.toISOString()
    });
    
    return utcDate;
  } catch (error) {
    console.error(`タイムゾーン→UTC変換エラー (${timezone}):`, error);
    // フォールバック: 元の日付をそのまま返す
    return new Date(localDate);
  }
};

/**
 * タイムゾーン情報をフォーマットして表示用文字列を生成
 */
export const formatTimezoneInfo = (timezone: string): string => {
  const tzInfo = SUPPORTED_TIMEZONES.find(tz => tz.value === timezone);
  if (tzInfo) {
    return `${tzInfo.label} (${tzInfo.offset})`;
  }
  
  // サポート外のタイムゾーンの場合
  try {
    const offset = getTimezoneOffset(timezone);
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    const offsetStr = `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return `${timezone} (${offsetStr})`;
  } catch (error) {
    return timezone;
  }
};

/**
 * カレンダー表示用のタイムゾーンラベルを生成
 */
export const getCalendarTimezoneLabel = (): string => {
  const timezone = getCurrentTimezone();
  
  // UTCの場合は特別表示
  if (timezone === 'UTC') {
    return 'UTC+0';
  }
  
  try {
    // より確実なオフセット計算
    const now = new Date();
    
    // Intl.DateTimeFormat APIを使用してオフセットを正確に計算
    const utcFormatter = new Intl.DateTimeFormat('en', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const localFormatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const utcParts = utcFormatter.formatToParts(now);
    const localParts = localFormatter.formatToParts(now);
    
    const getPartValue = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parseInt(parts.find(p => p.type === type)?.value || '0');
    
    // UTC時刻
    const utcHour = getPartValue(utcParts, 'hour');
    const utcMinute = getPartValue(utcParts, 'minute');
    const utcDay = getPartValue(utcParts, 'day');
    const utcMonth = getPartValue(utcParts, 'month');
    const utcYear = getPartValue(utcParts, 'year');
    
    // ローカル時刻
    const localHour = getPartValue(localParts, 'hour');
    const localMinute = getPartValue(localParts, 'minute');
    const localDay = getPartValue(localParts, 'day');
    const localMonth = getPartValue(localParts, 'month');
    const localYear = getPartValue(localParts, 'year');
    
    // 時刻を分に変換して差分を計算
    const utcTotalMinutes = utcYear * 525600 + utcMonth * 43800 + utcDay * 1440 + utcHour * 60 + utcMinute;
    const localTotalMinutes = localYear * 525600 + localMonth * 43800 + localDay * 1440 + localHour * 60 + localMinute;
    
    let offsetMinutes = localTotalMinutes - utcTotalMinutes;
    
    // 日付変更による調整（-12時間から+12時間の範囲に収める）
    if (offsetMinutes > 720) offsetMinutes -= 1440;
    if (offsetMinutes < -720) offsetMinutes += 1440;
    
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? '+' : '-';
    
    console.log('🌐 タイムゾーンオフセット計算:', {
      timezone,
      utc: `${utcYear}-${utcMonth}-${utcDay} ${utcHour}:${utcMinute}`,
      local: `${localYear}-${localMonth}-${localDay} ${localHour}:${localMinute}`,
      offsetMinutes,
      hours,
      minutes,
      sign
    });
    
    if (minutes === 0) {
      return `UTC${sign}${hours}`;
    } else {
      return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
    }
  } catch (error) {
    console.error('タイムゾーンラベル生成エラー:', error);
    // フォールバック: 既知のオフセットを使用
    const knownOffsets: { [key: string]: string } = {
      'Asia/Tokyo': 'UTC+9',
      'Asia/Seoul': 'UTC+9',
      'Asia/Shanghai': 'UTC+8',
      'Australia/Sydney': 'UTC+10',
      'Europe/London': 'UTC+0',
      'Europe/Paris': 'UTC+1',
      'America/New_York': 'UTC-5',
      'America/Los_Angeles': 'UTC-8',
      'UTC': 'UTC+0'
    };
    
    return knownOffsets[timezone] || 'UTC+0';
  }
};

/**
 * タイムゾーンの短縮表示名を取得
 */
export const getShortTimezoneDisplay = (timezone: string): string => {
  const shortNames: { [key: string]: string } = {
    'Asia/Tokyo': 'JST',
    'Asia/Seoul': 'KST', 
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'America/New_York': 'EST',
    'America/Los_Angeles': 'PST',
    'UTC': 'UTC'
  };
  
  return shortNames[timezone] || timezone.split('/').pop() || timezone;
};

/**
 * ユーザーのタイムゾーンでの現在時刻を取得（シンプル版）
 */
export const getCurrentTimeInUserTimezone = (): Date => {
  const timezone = getCurrentTimezone();
  const now = new Date();
  
  // UTCの場合は現在のUTC時刻を返す
  if (timezone === 'UTC') {
    const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    console.log('🌐 現在のUTC時刻:', {
      local: now.toLocaleString(),
      utc: utcTime.toISOString()
    });
    return utcTime;
  }
  
  // ブラウザネイティブのtoLocaleString()を使用してタイムゾーン変換
  try {
    const timeString = now.toLocaleString('sv-SE', { timeZone: timezone });
    const userTime = new Date(timeString);
    
    console.log('🌐 現在のユーザータイムゾーン時刻:', {
      timezone,
      now: now.toISOString(),
      timeString,
      userTime: userTime.toISOString()
    });
    
    return userTime;
  } catch (error) {
    console.error(`タイムゾーン ${timezone} での時刻取得に失敗:`, error);
    // フォールバック: UTC時刻をオフセット計算で変換
    const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return utcToUserTimezone(utcTime);
  }
};

/**
 * ユーザーのタイムゾーンでの現在時刻位置を計算（カレンダー用）
 */
export const getCurrentTimePosition = (): number => {
  const currentTime = getCurrentTimeInUserTimezone();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // 24時間 = 1440分を100%とする
  return (currentMinutes / 1440) * 100;
};

/**
 * ユーザーのタイムゾーンで時刻をフォーマット
 */
export const formatCurrentTime = (date?: Date): string => {
  const currentTime = date || getCurrentTimeInUserTimezone();
  
  return currentTime.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};