import { format } from 'date-fns'

// タイムゾーンリストの取得
export function getTimeZones() {
  const timezones = [
    { value: 'Pacific/Honolulu', label: 'ホノルル (GMT-10)', offset: -10 },
    { value: 'America/Anchorage', label: 'アンカレッジ (GMT-9)', offset: -9 },
    { value: 'America/Los_Angeles', label: 'ロサンゼルス (GMT-8)', offset: -8 },
    { value: 'America/Denver', label: 'デンバー (GMT-7)', offset: -7 },
    { value: 'America/Chicago', label: 'シカゴ (GMT-6)', offset: -6 },
    { value: 'America/New_York', label: 'ニューヨーク (GMT-5)', offset: -5 },
    { value: 'America/Sao_Paulo', label: 'サンパウロ (GMT-3)', offset: -3 },
    { value: 'Europe/London', label: 'ロンドン (GMT+0)', offset: 0 },
    { value: 'Europe/Paris', label: 'パリ (GMT+1)', offset: 1 },
    { value: 'Europe/Moscow', label: 'モスクワ (GMT+3)', offset: 3 },
    { value: 'Asia/Dubai', label: 'ドバイ (GMT+4)', offset: 4 },
    { value: 'Asia/Kolkata', label: 'コルカタ (GMT+5:30)', offset: 5.5 },
    { value: 'Asia/Shanghai', label: '上海 (GMT+8)', offset: 8 },
    { value: 'Asia/Tokyo', label: '東京 (GMT+9)', offset: 9 },
    { value: 'Australia/Sydney', label: 'シドニー (GMT+10)', offset: 10 },
    { value: 'Pacific/Auckland', label: 'オークランド (GMT+12)', offset: 12 },
  ]

  return timezones.sort((a, b) => a.offset - b.offset)
}

// 時間表示のフォーマット
export function formatTimeWithSettings(date: Date, timeFormat: '12h' | '24h', _timezone?: string): string {
  const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'

  // 基本的なフォーマット（タイムゾーン変換は後で実装）
  return format(date, formatString)
}

// 時間のみのフォーマット（時間軸用）
export function formatHour(hour: number, timeFormat: '12h' | '24h'): string {
  if (timeFormat === '24h') {
    return `${hour}:00`
  }

  if (hour === 0) return '12:00 AM'
  if (hour === 12) return '12:00 PM'
  if (hour < 12) return `${hour}:00 AM`
  return `${hour - 12}:00 PM`
}

// 現在時刻をタイムゾーンでフォーマット（簡易版）
export function formatInTimeZone(date: Date, _timezone: string, formatString: string): string {
  // 簡易実装：基本的なフォーマットのみ
  // 後でdate-fns-tzを導入して本格実装
  return format(date, formatString)
}

// タスクの時間をタイムゾーンに変換（簡易版）
export function convertTaskToTimezone<T extends Record<string, unknown>>(task: T, _timezone: string): T {
  // 簡易実装：現在はそのまま返す
  // 後でdate-fns-tzを導入して本格実装
  return task
}
