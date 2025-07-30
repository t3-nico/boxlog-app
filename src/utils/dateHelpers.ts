import { format, parse, parseISO, addMinutes, setHours, setMinutes } from 'date-fns';
import { getCurrentTimezone, getTimezoneOffset, utcToUserTimezone, userTimezoneToUtc } from './timezone';

// DB保存用: ユーザータイムゾーン → UTC（ISO文字列で返す）
export const localToUTC = (dateStr: string, timeStr: string): string => {
  // ユーザータイムゾーンの時間として入力された値を解釈
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  const localDate = new Date(dateTimeStr);
  
  // ユーザータイムゾーンからUTCに変換
  const utcDate = userTimezoneToUtc(localDate);
  
  console.log('🌐 localToUTC conversion:', {
    input: { date: dateStr, time: timeStr },
    timezone: getCurrentTimezone(),
    localDate: localDate.toLocaleString(),
    utcDate: utcDate.toISOString()
  });
  
  return utcDate.toISOString();
};

// フォーム表示用: UTC → ユーザータイムゾーン
export const utcToLocal = (utcString: string): { date: string; time: string } => {
  const utcDate = new Date(utcString);
  
  // UTCからユーザータイムゾーンに変換
  const localDate = utcToUserTimezone(utcDate);
  
  console.log('🌐 utcToLocal conversion:', {
    input: utcString,
    timezone: getCurrentTimezone(),
    utcDate: utcDate.toISOString(),
    localDate: localDate.toLocaleString()
  });
  
  return {
    date: format(localDate, 'yyyy-MM-dd'),
    time: format(localDate, 'HH:mm')
  };
};

// カレンダー表示用: UTC → フォーマット済み文字列
export const formatEventTime = (utcString: string): string => {
  const utcDate = new Date(utcString);
  const localDate = utcToUserTimezone(utcDate);
  return format(localDate, 'M月d日 HH:mm');
};

// 時間の妥当性チェック
export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  return start < end;
};

// ドラッグ&ドロップ用: Y座標から時間を計算
export const calculateTimeFromY = (yPosition: number, hourHeight: number = 48): { hours: number; minutes: number } => {
  const totalMinutes = Math.round((yPosition / hourHeight) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return { hours, minutes };
};

// ドラッグ&ドロップ用: 時間からY座標を計算
export const calculateYFromTime = (hours: number, minutes: number, hourHeight: number = 48): number => {
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / 60) * hourHeight;
};

// Date オブジェクトをローカル時間文字列に変換
export const dateToLocalStrings = (date: Date): { date: string; time: string } => {
  return {
    date: format(date, 'yyyy-MM-dd'),
    time: format(date, 'HH:mm')
  };
};

// ローカル時間文字列を Date オブジェクトに変換
export const localStringsToDate = (dateStr: string, timeStr: string): Date => {
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  return parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm:ss", new Date());
};

// イベントの期間を計算（分単位）
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());
  
  if (end <= start) {
    // 翌日への跨り
    const nextDayEnd = addMinutes(end, 24 * 60);
    return (nextDayEnd.getTime() - start.getTime()) / (1000 * 60);
  }
  
  return (end.getTime() - start.getTime()) / (1000 * 60);
};

// 🔥 BRUTAL: 文字列から最小限のDate作成（タイムゾーン安全）
export const createDateFromStrings = (dateStr: string, timeStr: string): Date => {
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  return parse(dateTimeStr, "yyyy-MM-dd'T'HH:mm:ss", new Date());
};

// デバッグ用: 時間変換の検証
export const debugTimeConversion = (label: string, originalDate: Date, utcString?: string) => {
  console.log(`🕐 ${label}:`, {
    original: originalDate,
    originalISO: originalDate.toISOString(),
    localFormat: format(originalDate, 'yyyy-MM-dd HH:mm'),
    utcString: utcString,
    timezone: TIMEZONE,
    offset: originalDate.getTimezoneOffset()
  });
};