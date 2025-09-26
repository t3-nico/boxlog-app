/**
 * BoxLog レイアウトシステム
 * @description コンポーネントの高さとコンテナ幅の定義
 */

/**
 * レイアウト設定
 * @description 実際に使用されているレイアウト設定のみ
 */
export const layout = {
  /**
   * コンテナ幅
   * @description 最大幅の制限
   */
  container: {
    small: 'max-w-2xl',   // 672px - 記事、フォーム
    medium: 'max-w-4xl',  // 896px - ダッシュボード
    large: 'max-w-6xl',   // 1152px - 全幅コンテンツ
    full: 'max-w-full',   // 制限なし
  },
  
  /**
   * グリッドレイアウト
   * @description よく使うグリッドパターン
   */
  grid: {
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    sidebar: 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6',
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  },
  
  /**
   * よく使われるコンポーネントの高さ
   * @description 実際に使用されているheights設定
   */
  heights: {
    header: {
      xs: 'h-8',         // 32px - メインヘッダー（実際に使用）
      compact: 'h-10',    // 40px - InspectorToggle（実際に使用）
      default: 'h-12',    // 48px - 標準ヘッダー
      large: 'h-16',      // 64px - 大きいヘッダー
    },
    button: {
      sm: 'h-8',         // 32px - 小ボタン
      md: 'h-10',        // 40px - 標準ボタン
      lg: 'h-12',        // 48px - 大ボタン
    },
    input: {
      sm: 'h-8',         // 32px - 小入力
      md: 'h-10',        // 40px - 標準入力
      lg: 'h-12',        // 48px - 大入力
    },
  },
} as const

/**
 * Flexboxレイアウトパターン
 * @description よく使用されるflexboxパターン
 */
export const flexPatterns = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-center justify-start',
  end: 'flex items-center justify-end',
  column: 'flex flex-col',
  wrap: 'flex flex-wrap',
} as const

/**
 * グリッドレイアウトパターン
 * @description よく使用されるgridパターン
 */
export const gridPatterns = {
  auto: 'grid grid-cols-auto',
  equal: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  sidebar: 'grid grid-cols-1 lg:grid-cols-[280px_1fr]',
  responsive: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
} as const

/**
 * レスポンシブコンテナ
 * @description レスポンシブなコンテナスタイル
 */
export const responsiveContainer = {
  page: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  content: 'w-full max-w-4xl mx-auto px-4 sm:px-6',
  narrow: 'w-full max-w-2xl mx-auto px-4',
} as const

/**
 * レイアウトユーティリティ
 * @description レイアウト関連のユーティリティ関数
 */
export const layoutUtils = {
  centerContent: 'min-h-screen flex items-center justify-center',
  fullHeight: 'min-h-screen',
  stickyHeader: 'sticky top-0 z-50',
  fixedFooter: 'fixed bottom-0 left-0 right-0',
} as const

/**
 * BoxLog 3カラムレイアウト
 * @description メインアプリケーションのカラム設定
 */
export const columns = {
  sidebar: {
    default: 'w-64 flex-shrink-0',
    collapsed: 'w-16 flex-shrink-0',
    mobile: 'w-full',
  },
  main: {
    default: 'flex-1 min-w-0',
    fullWidth: 'w-full',
  },
  inspector: {
    default: 'w-80 flex-shrink-0',
    collapsed: 'w-0 overflow-hidden',
    mobile: 'w-full',
  },
} as const

/**
 * レイアウトパターン
 * @description 一般的なレイアウトパターン
 */
export const layoutPatterns = {
  threeColumn: 'flex min-h-screen',
  twoColumn: 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6',
  singleColumn: 'max-w-4xl mx-auto',
  fullWidth: 'w-full',
} as const

/**
 * 単一カラムレイアウトのエクスポート
 * @description board/page.tsxで使用されている
 */
export const {singleColumn} = layoutPatterns

/**
 * レイアウトヘルパー
 * @description レイアウト作成時のヘルパー関数
 */
export const layoutHelpers = {
  getColumnClass: (type: 'sidebar' | 'main' | 'inspector', variant = 'default') => {
    const columnType = columns[type]
    const typedColumnType = columnType as Record<string, string> & { default?: string }
    return variant in typedColumnType ? typedColumnType[variant] : typedColumnType.default || ''
  },
  getContainerClass: (size: keyof typeof layout.container) => {
    return layout.container[size]
  },
} as const

/**
 * Z-Index システム
 * @description アプリケーション全体のz-indexの階層管理
 */
export const zIndex = {
  background: 'z-0',
  base: 'z-10',
  dropdown: 'z-20',
  sticky: 'z-30',
  overlay: 'z-40',
  modal: 'z-50',
  toast: 'z-60',
  tooltip: 'z-70',
} as const

/**
 * Z-Index クラス
 * @description 各コンポーネント用のz-indexクラス
 */
export const zIndexClasses = {
  navbar: 'z-30',
  sidebar: 'z-20',
  dropdown: 'z-20',
  modal: 'z-50',
  toast: 'z-60',
  tooltip: 'z-70',
} as const

/**
 * コンポーネント別Z-Index
 * @description 特定のコンポーネント用のz-index設定
 */
export const componentZIndex = {
  FloatingActionButton: 'z-50',
  MobileBottomNavigation: 'z-40',
  Inspector: 'z-30',
  Header: 'z-30',
  Sidebar: 'z-20',
  Dropdown: 'z-20',
} as const

/**
 * ブレークポイント
 * @description Tailwindのブレークポイント
 */
export const breakpoints = {
  sm: '640px',   // スマートフォン（大）
  md: '768px',   // タブレット
  lg: '1024px',  // デスクトップ（小）
  xl: '1280px',  // デスクトップ（大）
  '2xl': '1536px', // デスクトップ（特大）
} as const

export default layout