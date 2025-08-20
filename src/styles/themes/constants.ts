/**
 * スタイル関連の定数定義
 * 型安全性の向上と使用箇所でのタイポ防止
 */

/**
 * CSS変数名の定数（css-variables.tsから再エクスポート）
 */
export { CSS_VARIABLE_NAMES } from './css-variables'

/**
 * よく使用されるCSS変数名のショートカット
 */
export const COLORS = {
  BACKGROUND: 'rgb(var(--color-background))',
  FOREGROUND: 'rgb(var(--color-foreground))',
  PRIMARY: 'rgb(var(--color-primary))',
  SECONDARY: 'rgb(var(--color-secondary))',
  MUTED: 'rgb(var(--color-muted))',
  BORDER: 'rgb(var(--color-border))',
  DESTRUCTIVE: 'rgb(var(--color-destructive))',
} as const

/**
 * カレンダー関連のCSS変数
 */
export const CALENDAR_VARS = {
  HOUR_HEIGHT: 'var(--calendar-hour-height)',
  TIME_COLUMN_WIDTH: 'var(--calendar-time-column-width)',
  HEADER_HEIGHT: 'var(--calendar-header-height)',
  SIDEBAR_WIDTH: 'var(--calendar-sidebar-width)',
  CURRENT_TIMELINE: 'rgb(var(--calendar-current-timeline))',
} as const

/**
 * ブレークポイント定数
 */
export const BREAKPOINTS = {
  MOBILE: '639px',
  TABLET: '1023px',
  DESKTOP: '1280px',
} as const

/**
 * テーマモード定数
 */
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

/**
 * アニメーション定数
 */
export const ANIMATIONS = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '250ms',
    SLOW: '400ms',
  },
  EASING: {
    STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
    SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

/**
 * Z-index定数
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1400,
  TOAST: 1700,
  TOOLTIP: 1800,
  CALENDAR: {
    EVENT_BLOCK: 10,
    CURRENT_TIME_LINE: 20,
    DRAG_PREVIEW: 30,
    POPUP: 40,
  },
} as const

/**
 * コンポーネントサイズ定数
 */
export const COMPONENT_SIZES = {
  BUTTON: {
    XS: { height: '1.5rem', padding: '0.25rem 0.5rem' },
    SM: { height: '2rem', padding: '0.5rem 0.75rem' },
    MD: { height: '2.5rem', padding: '0.5rem 1rem' },
    LG: { height: '3rem', padding: '0.75rem 1.5rem' },
    XL: { height: '3.5rem', padding: '1rem 2rem' },
  },
  ICON: {
    XS: '0.75rem',
    SM: '1rem',
    MD: '1.25rem',
    LG: '1.5rem',
    XL: '2rem',
  },
} as const

/**
 * カレンダー専用定数
 */
export const CALENDAR_CONSTANTS = {
  HOUR_HEIGHT: {
    MOBILE: '3rem',
    TABLET: '3.75rem',
    DESKTOP: '4.5rem',
  },
  TIME_COLUMN_WIDTH: '4rem',
  HEADER_HEIGHT: '4rem',
  SIDEBAR_WIDTH: '16rem',
  GRID_COLUMNS: {
    DAY: 'var(--calendar-time-column-width) 1fr',
    THREE_DAY: 'var(--calendar-time-column-width) repeat(3, 1fr)',
    WEEK: 'var(--calendar-time-column-width) repeat(7, 1fr)',
  },
} as const

/**
 * アクセシビリティ関連定数
 */
export const A11Y = {
  FOCUS_RING: '0 0 0 2px rgb(var(--color-ring))',
  MIN_TOUCH_SIZE: '44px',
  HIGH_CONTRAST_BORDER: '2px solid',
} as const

/**
 * レスポンシブ関連のヘルパー関数
 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.MOBILE})`,
  tablet: `(min-width: 640px) and (max-width: ${BREAKPOINTS.TABLET})`,
  desktop: `(min-width: 1024px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: high)',
  darkMode: '(prefers-color-scheme: dark)',
} as const

/**
 * よく使用されるスタイル文字列
 */
export const COMMON_STYLES = {
  FLEX_CENTER: 'flex items-center justify-center',
  FULL_SIZE: 'w-full h-full',
  ABSOLUTE_FULL: 'absolute inset-0',
  GLASS_EFFECT: 'backdrop-blur-sm bg-background/80 border border-border/50',
  BUTTON_BASE: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
} as const