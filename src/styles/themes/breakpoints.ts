/**
 * レスポンシブブレークポイント設定
 */

// 基本ブレークポイント（Tailwindベース）
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// 数値版ブレークポイント（計算用）
export const breakpointsNumeric = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// メディアクエリ生成ヘルパー
export const mediaQueries = {
  // 以上（min-width）
  up: {
    xs: `@media (min-width: ${breakpoints.xs})`,
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  },
  
  // 以下（max-width）
  down: {
    xs: `@media (max-width: ${breakpointsNumeric.xs - 1}px)`,
    sm: `@media (max-width: ${breakpointsNumeric.sm - 1}px)`,
    md: `@media (max-width: ${breakpointsNumeric.md - 1}px)`,
    lg: `@media (max-width: ${breakpointsNumeric.lg - 1}px)`,
    xl: `@media (max-width: ${breakpointsNumeric.xl - 1}px)`,
    '2xl': `@media (max-width: ${breakpointsNumeric['2xl'] - 1}px)`,
  },
  
  // 範囲指定
  between: {
    'xs-sm': `@media (min-width: ${breakpoints.xs}) and (max-width: ${breakpointsNumeric.sm - 1}px)`,
    'sm-md': `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpointsNumeric.md - 1}px)`,
    'md-lg': `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpointsNumeric.lg - 1}px)`,
    'lg-xl': `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpointsNumeric.xl - 1}px)`,
    'xl-2xl': `@media (min-width: ${breakpoints.xl}) and (max-width: ${breakpointsNumeric['2xl'] - 1}px)`,
  },
  
  // デバイス指向
  mobile: `@media (max-width: ${breakpointsNumeric.sm - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpointsNumeric.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg})`,
} as const

// デバイスタイプ別設定
export const deviceConfig = {
  mobile: {
    breakpoint: breakpoints.sm,
    maxWidth: breakpointsNumeric.sm - 1,
    
    // カレンダー固有設定
    calendar: {
      hourHeight: '3rem',      // 48px
      timeColumnWidth: '3rem', // 48px
      headerHeight: '3.5rem',  // 56px
      sidebarWidth: '100%',    // フルスクリーン
    },
    
    // コンポーネントサイズ
    button: {
      height: '2.75rem',       // 44px (タッチ対応)
      fontSize: '1rem',        // 16px
    },
    
    input: {
      height: '2.75rem',       // 44px (タッチ対応)
      fontSize: '1rem',        // 16px
    },
    
    // スペーシング調整
    padding: '1rem',           // 16px
    gap: '0.75rem',           // 12px
  },
  
  tablet: {
    breakpoint: breakpoints.md,
    minWidth: breakpointsNumeric.sm,
    maxWidth: breakpointsNumeric.lg - 1,
    
    // カレンダー固有設定
    calendar: {
      hourHeight: '3.75rem',   // 60px
      timeColumnWidth: '4rem', // 64px
      headerHeight: '4rem',    // 64px
      sidebarWidth: '18rem',   // 288px
    },
    
    // コンポーネントサイズ
    button: {
      height: '2.5rem',        // 40px
      fontSize: '0.875rem',    // 14px
    },
    
    input: {
      height: '2.5rem',        // 40px
      fontSize: '0.875rem',    // 14px
    },
    
    // スペーシング調整
    padding: '1.5rem',         // 24px
    gap: '1rem',              // 16px
  },
  
  desktop: {
    breakpoint: breakpoints.lg,
    minWidth: breakpointsNumeric.lg,
    
    // カレンダー固有設定
    calendar: {
      hourHeight: '4.5rem',    // 72px
      timeColumnWidth: '4rem', // 64px
      headerHeight: '4rem',    // 64px
      sidebarWidth: '16rem',   // 256px
    },
    
    // コンポーネントサイズ
    button: {
      height: '2.5rem',        // 40px
      fontSize: '0.875rem',    // 14px
    },
    
    input: {
      height: '2.5rem',        // 40px
      fontSize: '0.875rem',    // 14px
    },
    
    // スペーシング調整
    padding: '2rem',           // 32px
    gap: '1.5rem',            // 24px
  },
} as const

// コンテナサイズ設定
export const containers = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',       // 少し小さめに調整
  '3xl': '1600px',
  '4xl': '1800px',
} as const

// グリッドシステム設定
export const gridSystem = {
  // 12カラムグリッド
  columns: 12,
  
  // ガッター（溝）サイズ
  gutters: {
    xs: '0.5rem',  // 8px
    sm: '0.75rem', // 12px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  
  // カラム比率
  columnRatios: {
    '1/12': '8.333333%',
    '2/12': '16.666667%',
    '3/12': '25%',
    '4/12': '33.333333%',
    '5/12': '41.666667%',
    '6/12': '50%',
    '7/12': '58.333333%',
    '8/12': '66.666667%',
    '9/12': '75%',
    '10/12': '83.333333%',
    '11/12': '91.666667%',
    '12/12': '100%',
  },
} as const

// カレンダー専用レスポンシブ設定
export const calendarResponsive = {
  // ビュー別表示設定
  views: {
    mobile: ['day', 'schedule'],              // モバイルでは限定表示
    tablet: ['day', '3day', 'week', 'schedule'], // タブレットは中程度
    desktop: ['day', '3day', 'week', '2week', 'schedule'], // デスクトップは全表示
  },
  
  // 時間軸の表示間隔
  timeAxis: {
    mobile: {
      interval: 60,        // 1時間間隔
      showMinutes: false,  // 分表示なし
    },
    tablet: {
      interval: 60,        // 1時間間隔
      showMinutes: true,   // 分表示あり
    },
    desktop: {
      interval: 30,        // 30分間隔
      showMinutes: true,   // 分表示あり
    },
  },
  
  // イベント表示
  events: {
    mobile: {
      titleLength: 15,     // タイトル文字数制限
      showDescription: false, // 詳細非表示
      minHeight: '2rem',   // 最小高さ
    },
    tablet: {
      titleLength: 25,     // タイトル文字数制限
      showDescription: true,  // 詳細表示
      minHeight: '2.5rem', // 最小高さ
    },
    desktop: {
      titleLength: 50,     // タイトル文字数制限
      showDescription: true,  // 詳細表示
      minHeight: '3rem',   // 最小高さ
    },
  },
  
  // サイドバー動作
  sidebar: {
    mobile: 'overlay',     // オーバーレイ表示
    tablet: 'collapsible', // 折りたたみ可能
    desktop: 'fixed',      // 固定表示
  },
} as const

// アクセシビリティ関連設定
export const accessibilityBreakpoints = {
  // 高コントラスト対応
  highContrast: '@media (prefers-contrast: high)',
  
  // モーション設定
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // カラースキーム
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
  
  // 入力方法
  touchDevice: '@media (hover: none) and (pointer: coarse)',
  mouseDevice: '@media (hover: hover) and (pointer: fine)',
  
  // 画面向き
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',
} as const

// 型定義
export type BreakpointKey = keyof typeof breakpoints
export type DeviceType = keyof typeof deviceConfig
export type ContainerSize = keyof typeof containers
export type MediaQueryType = keyof typeof mediaQueries
export type CalendarViewType = 'day' | '3day' | 'week' | '2week' | 'schedule'