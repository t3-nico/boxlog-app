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
 * ユーザーのタイムゾーン設定をローカルストレージに保存
 */
export const setUserTimezone = (timezone: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user-timezone', timezone);
    console.log('タイムゾーン設定を保存:', timezone);
  } catch (error) {
    console.error('タイムゾーン設定の保存に失敗:', error);
  }
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
 * UTC+9 = -540分 (JSTの場合)
 */
export const getTimezoneOffset = (timezone: string): number => {
  try {
    // 現在時刻でのオフセットを計算
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    
    const offsetMs = target.getTime() - utc.getTime();
    const offsetMinutes = Math.round(offsetMs / 60000);
    
    console.log(`タイムゾーン ${timezone} のオフセット: ${offsetMinutes}分`);
    return offsetMinutes;
  } catch (error) {
    console.error(`タイムゾーン ${timezone} のオフセット計算に失敗:`, error);
    // フォールバック: Asia/Tokyoの場合は540分（UTC+9）
    if (timezone === 'Asia/Tokyo') return 540;
    return 0; // UTCをフォールバック
  }
};

/**
 * UTC時間をユーザーのタイムゾーンに変換
 */
export const utcToUserTimezone = (utcDate: Date): Date => {
  const timezone = getCurrentTimezone();
  const offset = getTimezoneOffset(timezone);
  
  // オフセットを適用（offsetは分単位）
  const localDate = new Date(utcDate.getTime() + offset * 60000);
  
  console.log('UTC → ユーザータイムゾーン変換:', {
    timezone,
    utc: utcDate.toISOString(),
    local: localDate.toISOString(),
    offset: `${offset}分`
  });
  
  return localDate;
};

/**
 * ユーザーのタイムゾーンの時間をUTCに変換
 */
export const userTimezoneToUtc = (localDate: Date): Date => {
  const timezone = getCurrentTimezone();
  const offset = getTimezoneOffset(timezone);
  
  // オフセットを逆適用（offsetは分単位）
  const utcDate = new Date(localDate.getTime() - offset * 60000);
  
  console.log('ユーザータイムゾーン → UTC変換:', {
    timezone,
    local: localDate.toISOString(),
    utc: utcDate.toISOString(),
    offset: `${offset}分`
  });
  
  return utcDate;
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