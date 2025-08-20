/**
 * 意味的カラー - 状態やアクションを表すカラー定義
 */

// shadcn/ui コアカラーシステム（ライト・ダークモード対応）
export const uiColors = {
  light: {
    background: { rgb: '255 255 255', hex: '#ffffff' },
    foreground: { rgb: '15 23 42', hex: '#0f172a' },
    card: { rgb: '255 255 255', hex: '#ffffff' },
    cardForeground: { rgb: '15 23 42', hex: '#0f172a' },
    popover: { rgb: '255 255 255', hex: '#ffffff' },
    popoverForeground: { rgb: '15 23 42', hex: '#0f172a' },
    primary: { rgb: '59 130 246', hex: '#3b82f6' },
    primaryForeground: { rgb: '255 255 255', hex: '#ffffff' },
    secondary: { rgb: '248 250 252', hex: '#f8fafc' },
    secondaryForeground: { rgb: '15 23 42', hex: '#0f172a' },
    muted: { rgb: '248 250 252', hex: '#f8fafc' },
    mutedForeground: { rgb: '100 116 139', hex: '#64748b' },
    accent: { rgb: '248 250 252', hex: '#f8fafc' },
    accentForeground: { rgb: '15 23 42', hex: '#0f172a' },
    destructive: { rgb: '239 68 68', hex: '#ef4444' },
    destructiveForeground: { rgb: '255 255 255', hex: '#ffffff' },
    border: { rgb: '226 232 240', hex: '#e2e8f0' },
    input: { rgb: '226 232 240', hex: '#e2e8f0' },
    ring: { rgb: '59 130 246', hex: '#3b82f6' },
  },
  dark: {
    background: { rgb: '15 23 42', hex: '#0f172a' },
    foreground: { rgb: '248 250 252', hex: '#f8fafc' },
    card: { rgb: '30 41 59', hex: '#1e293b' },
    cardForeground: { rgb: '248 250 252', hex: '#f8fafc' },
    popover: { rgb: '30 41 59', hex: '#1e293b' },
    popoverForeground: { rgb: '248 250 252', hex: '#f8fafc' },
    primary: { rgb: '96 165 250', hex: '#60a5fa' },
    primaryForeground: { rgb: '15 23 42', hex: '#0f172a' },
    secondary: { rgb: '51 65 85', hex: '#334155' },
    secondaryForeground: { rgb: '248 250 252', hex: '#f8fafc' },
    muted: { rgb: '51 65 85', hex: '#334155' },
    mutedForeground: { rgb: '148 163 184', hex: '#94a3b8' },
    accent: { rgb: '51 65 85', hex: '#334155' },
    accentForeground: { rgb: '248 250 252', hex: '#f8fafc' },
    destructive: { rgb: '248 113 113', hex: '#f87171' },
    destructiveForeground: { rgb: '248 250 252', hex: '#f8fafc' },
    border: { rgb: '51 65 85', hex: '#334155' },
    input: { rgb: '51 65 85', hex: '#334155' },
    ring: { rgb: '96 165 250', hex: '#60a5fa' },
  },
} as const

// 成功・エラー・警告・情報カラー
export const semanticColors = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',    // green-500
    600: '#16a34a',    // green-600
    900: '#14532d',
    rgb: '34 197 94',  // green-500 RGB
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',    // amber-500
    600: '#d97706',    // amber-600
    900: '#78350f',
    rgb: '245 158 11', // amber-500 RGB
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',    // red-500
    600: '#dc2626',    // red-626
    900: '#7f1d1d',
    rgb: '239 68 68',  // red-500 RGB
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',    // blue-500
    600: '#2563eb',    // blue-600
    900: '#1e3a8a',
    rgb: '59 130 246', // blue-500 RGB
  },
} as const

// タスク状態カラー
export const taskStatusColors = {
  todo: {
    rgb: '107 114 128',    // gray-500
    hex: '#6b7280',
  },
  inProgress: {
    rgb: '59 130 246',     // blue-500
    hex: '#3b82f6',
  },
  completed: {
    rgb: '34 197 94',      // green-500
    hex: '#22c55e',
  },
  cancelled: {
    rgb: '239 68 68',      // red-500
    hex: '#ef4444',
  },
} as const

// 優先度カラー
export const priorityColors = {
  low: {
    rgb: '34 197 94',      // green-500
    hex: '#22c55e',
  },
  medium: {
    rgb: '245 158 11',     // amber-500
    hex: '#f59e0b',
  },
  high: {
    rgb: '239 68 68',      // red-500
    hex: '#ef4444',
  },
} as const

// クロノタイプカラー（生体リズム）
export const chronotypeColors = {
  morning: {
    rgb: '59 130 246',     // blue-500
    hex: '#3b82f6',
  },
  evening: {
    rgb: '139 92 246',     // violet-500
    hex: '#8b5cf6',
  },
  balanced: {
    rgb: '34 197 94',      // green-500
    hex: '#22c55e',
  },
} as const

// タグプリセットカラー（16色）
export const tagPresetColors = {
  blue: { rgb: '59 130 246', hex: '#3b82f6' },       // blue-500
  emerald: { rgb: '16 185 129', hex: '#10b981' },    // emerald-500
  amber: { rgb: '245 158 11', hex: '#f59e0b' },      // amber-500
  red: { rgb: '239 68 68', hex: '#ef4444' },         // red-500
  violet: { rgb: '139 92 246', hex: '#8b5cf6' },     // violet-500
  cyan: { rgb: '6 182 212', hex: '#06b6d4' },        // cyan-500
  lime: { rgb: '132 204 22', hex: '#84cc16' },       // lime-500
  orange: { rgb: '249 115 22', hex: '#f97316' },     // orange-500
  pink: { rgb: '236 72 153', hex: '#ec4899' },       // pink-500
  gray: { rgb: '107 114 128', hex: '#6b7280' },      // gray-500
  yellow: { rgb: '234 179 8', hex: '#eab308' },      // yellow-500
  green: { rgb: '34 197 94', hex: '#22c55e' },       // green-500
  teal: { rgb: '20 184 166', hex: '#14b8a6' },       // teal-500
  sky: { rgb: '14 165 233', hex: '#0ea5e9' },        // sky-500
  indigo: { rgb: '99 102 241', hex: '#6366f1' },     // indigo-500
  purple: { rgb: '168 85 247', hex: '#a855f7' },     // purple-500
  fuchsia: { rgb: '217 70 239', hex: '#d946ef' },    // fuchsia-500
} as const

// カレンダー専用カラー
export const calendarColors = {
  currentTimeLine: {
    rgb: '239 68 68',      // red-500 (現在時刻線)
    hex: '#ef4444',
  },
  businessHours: {
    rgb: '59 130 246',     // blue-500 (営業時間ハイライト)
    hex: '#3b82f6',
    opacity: '0.05',       // 透明度
  },
  weekend: {
    rgb: '107 114 128',    // gray-500 (週末テキスト)
    hex: '#6b7280',
  },
} as const

// 型定義
export type SemanticColorType = keyof typeof semanticColors
export type TaskStatus = keyof typeof taskStatusColors
export type Priority = keyof typeof priorityColors
export type Chronotype = keyof typeof chronotypeColors
export type TagPresetColor = keyof typeof tagPresetColors