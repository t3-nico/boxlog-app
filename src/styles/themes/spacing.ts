/**
 * 間隔・サイズ設定 - 8pxグリッドシステム準拠
 */

// 基本スペーシング（8pxグリッド）
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const

// コンポーネント専用サイズ
export const componentSizes = {
  // ヘッダー高さ
  header: {
    mobile: '3.5rem',    // 56px
    desktop: '4rem',     // 64px
  },
  
  // サイドバー幅
  sidebar: {
    collapsed: '4rem',   // 64px
    expanded: '16rem',   // 256px
  },
  
  // カレンダー専用
  calendar: {
    hourHeight: {
      mobile: '3rem',    // 48px
      tablet: '3.75rem', // 60px
      desktop: '4.5rem', // 72px
    },
    timeColumnWidth: '4rem', // 64px
    miniCalendarWidth: '18rem', // 288px
  },
  
  // ボタンサイズ
  button: {
    xs: { height: '1.5rem', padding: '0.25rem 0.5rem' },   // 24px h
    sm: { height: '2rem', padding: '0.5rem 0.75rem' },     // 32px h
    md: { height: '2.5rem', padding: '0.5rem 1rem' },      // 40px h
    lg: { height: '3rem', padding: '0.75rem 1.5rem' },     // 48px h
    xl: { height: '3.5rem', padding: '1rem 2rem' },        // 56px h
  },
  
  // アイコンサイズ
  icon: {
    xs: '0.75rem',   // 12px
    sm: '1rem',      // 16px
    md: '1.25rem',   // 20px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
  },
  
  // 入力フィールド
  input: {
    height: '2.5rem',      // 40px
    padding: '0.5rem 0.75rem', // 8px 12px
  },
  
  // カード
  card: {
    padding: '1.5rem',     // 24px
    gap: '1rem',           // 16px
  },
} as const

// Z-index階層
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  
  // カレンダー専用
  calendar: {
    timeColumn: 5,
    eventBlock: 10,
    currentTimeLine: 20,
    dragPreview: 30,
    popup: 40,
  },
} as const

// ボーダー幅
export const borderWidth = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const

// 角丸設定
export const borderRadius = {
  none: '0px',
  xs: '0.25rem',   // 4px
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
} as const

// 最大幅設定
export const maxWidth = {
  xs: '20rem',     // 320px
  sm: '24rem',     // 384px
  md: '28rem',     // 448px
  lg: '32rem',     // 512px
  xl: '36rem',     // 576px
  '2xl': '42rem',  // 672px
  '3xl': '48rem',  // 768px
  '4xl': '56rem',  // 896px
  '5xl': '64rem',  // 1024px
  '6xl': '72rem',  // 1152px
  '7xl': '80rem',  // 1280px
  full: '100%',
  screen: '100vw',
} as const

// コンテンツ幅（レスポンシブ）
export const contentWidth = {
  mobile: '100%',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultraWide: '1536px',
} as const

// 型定義
export type SpacingKey = keyof typeof spacing
export type ZIndexKey = keyof typeof zIndex
export type BorderRadiusKey = keyof typeof borderRadius
export type MaxWidthKey = keyof typeof maxWidth