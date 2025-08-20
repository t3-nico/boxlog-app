/**
 * Calendar コンポーネントの統一スタイル定義
 * カレンダー関連の全スタイルを中央管理
 */

import { cva } from 'class-variance-authority'

// === イベントブロックのスタイル ===
export const eventBlockVariants = cva(
  'rounded-md shadow-sm border-l-4 px-2 py-1 overflow-hidden hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all cursor-grab',
  {
    variants: {
      color: {
        blue: 'bg-blue-100 border-blue-500 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
        red: 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900 dark:text-red-100',
        green: 'bg-green-100 border-green-500 text-green-900 dark:bg-green-900 dark:text-green-100',
        yellow: 'bg-yellow-100 border-yellow-500 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
        purple: 'bg-purple-100 border-purple-500 text-purple-900 dark:bg-purple-900 dark:text-purple-100',
        gray: 'bg-gray-100 border-gray-500 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
      },
      state: {
        default: '',
        selected: 'ring-2 ring-blue-500 ring-offset-1',
        dragging: 'cursor-grabbing scale-[1.02] opacity-80',
        hovered: 'shadow-lg'
      },
      size: {
        compact: 'px-1 py-0.5 text-xs',
        default: 'px-2 py-1 text-sm',
        large: 'px-3 py-2 text-base'
      }
    },
    defaultVariants: {
      color: 'blue',
      state: 'default',
      size: 'default'
    }
  }
)

// === 現在時刻線のスタイル ===
export const currentTimeLineStyles = {
  container: 'absolute z-30 pointer-events-none w-full',
  label: 'absolute bg-red-500 text-white text-xs px-1 py-0.5 rounded text-[11px] top-[-10px]',
  dot: 'absolute w-2 h-2 bg-red-500 rounded-full top-[-3px]',
  line: 'absolute h-[2px] bg-red-500'
} as const

// === グリッドラインのスタイル ===
export const gridLineStyles = {
  hourLine: 'border-t border-gray-200 dark:border-gray-800',
  halfHourLine: 'border-t border-gray-100 dark:border-gray-900 border-dashed',
  quarterHourLine: 'border-t border-gray-50 dark:border-gray-950 border-dotted'
} as const

// === 時間列のスタイル ===
export const timeColumnStyles = {
  container: 'flex flex-col border-r border-gray-200 dark:border-gray-800',
  timeLabel: 'text-xs text-gray-600 dark:text-gray-400 text-right pr-2 leading-none select-none',
  timeLabelCompact: 'text-[10px] text-gray-500 dark:text-gray-500 text-right pr-1 leading-none select-none'
} as const

// === 日付ヘッダーのスタイル ===
export const dateHeaderVariants = cva(
  'flex items-center justify-center font-medium border-b border-gray-200 dark:border-gray-800 bg-background',
  {
    variants: {
      type: {
        day: 'flex-col py-2 text-center',
        week: 'py-3 px-4',
        month: 'py-1 px-2 text-sm'
      },
      state: {
        default: '',
        today: 'bg-primary/5 text-primary font-semibold',
        selected: 'bg-primary/10 text-primary',
        other: 'text-muted-foreground'
      }
    },
    defaultVariants: {
      type: 'day',
      state: 'default'
    }
  }
)

// === カレンダーレイアウトのスタイル ===
export const calendarLayoutStyles = {
  // メインコンテナ
  container: 'flex flex-col h-full bg-background',
  
  // ヘッダー領域
  header: 'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800',
  
  // メインコンテンツ領域
  content: 'flex-1 overflow-hidden',
  
  // スクロール可能なカレンダー
  scrollContainer: 'h-full overflow-y-auto',
  
  // グリッドレイアウト
  grid: 'grid relative',
  
  // 日列
  dayColumn: 'relative border-r border-gray-100 dark:border-gray-900 last:border-r-0',
  
  // 時間軸
  timeAxis: 'sticky top-0 z-20 bg-background border-b border-gray-200 dark:border-gray-800'
} as const

// === ビュー切り替えのスタイル ===
export const viewSwitcherVariants = cva(
  'inline-flex items-center justify-center rounded-md p-1 bg-muted text-muted-foreground',
  {
    variants: {
      variant: {
        default: '',
        pills: 'space-x-1'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export const viewSwitcherItemVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      state: {
        default: 'text-muted-foreground hover:text-foreground',
        active: 'bg-background text-foreground shadow-sm'
      }
    },
    defaultVariants: {
      state: 'default'
    }
  }
)

// === ミニカレンダーのスタイル ===
export const miniCalendarStyles = {
  container: 'w-full max-w-sm',
  header: 'flex items-center justify-between px-3 py-2',
  grid: 'grid grid-cols-7 gap-1 text-center text-sm',
  dayHeader: 'text-xs font-medium text-muted-foreground h-8 w-8 flex items-center justify-center',
  dayCell: [
    'h-8 w-8 flex items-center justify-center rounded-md',
    'hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  ],
  today: 'bg-primary text-primary-foreground font-semibold',
  selected: 'bg-primary/20 text-primary font-medium',
  otherMonth: 'text-muted-foreground/50'
} as const

// === アニメーション関連のスタイル ===
export const calendarAnimations = {
  eventDrag: 'transition-transform duration-150 ease-out',
  eventHover: 'transition-all duration-200 ease-in-out',
  viewTransition: 'transition-opacity duration-300 ease-in-out',
  slideIn: 'animate-in slide-in-from-right-2 duration-200',
  slideOut: 'animate-out slide-out-to-left-2 duration-200',
  fadeIn: 'animate-in fade-in-0 duration-200',
  fadeOut: 'animate-out fade-out-0 duration-200'
} as const

// === レスポンシブ対応のスタイル ===
export const responsiveCalendarStyles = {
  // モバイル用のコンパクトスタイル
  mobile: {
    eventBlock: 'px-1 py-0.5 text-xs border-l-2',
    timeLabel: 'text-[10px] px-1',
    header: 'px-2 py-2 text-sm'
  },
  
  // タブレット用のスタイル
  tablet: {
    eventBlock: 'px-2 py-1 text-sm border-l-3',
    timeLabel: 'text-xs px-2',
    header: 'px-3 py-3 text-base'
  },
  
  // デスクトップ用のスタイル
  desktop: {
    eventBlock: 'px-3 py-2 text-base border-l-4',
    timeLabel: 'text-sm px-3',
    header: 'px-4 py-4 text-lg'
  }
} as const

// === Z-INDEX 管理 ===
export const calendarZIndex = {
  background: 0,
  grid: 10,
  events: 20,
  currentTime: 30,
  dragging: 40,
  modal: 50,
  overlay: 60,
  tooltip: 70
} as const

// === カラーパレット（イベント用） ===
export const eventColorPalette = {
  primary: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    border: 'border-blue-500',
    text: 'text-blue-900 dark:text-blue-100'
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900',
    border: 'border-green-500',
    text: 'text-green-900 dark:text-green-100'
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    border: 'border-yellow-500',
    text: 'text-yellow-900 dark:text-yellow-100'
  },
  danger: {
    bg: 'bg-red-100 dark:bg-red-900',
    border: 'border-red-500',
    text: 'text-red-900 dark:text-red-100'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    border: 'border-purple-500',
    text: 'text-purple-900 dark:text-purple-100'
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-500',
    text: 'text-gray-900 dark:text-gray-100'
  }
} as const