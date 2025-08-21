/**
 * BoxLog レイアウトシステム
 * @description コンテナ幅とグリッドレイアウトの定義
 */

// ============================================
// 基本レイアウトシステム
// ============================================

/**
 * 基本レイアウトシステム
 * @description コンテナ幅とグリッド
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
} as const

// ============================================
// BoxLog 3カラムレイアウト（8px準拠）
// ============================================

/**
 * BoxLog アプリ内3カラムレイアウト
 * 左：ナビ（狭）、中：サイドバー（中）、右：メイン（広）
 */
export const columns = {
  /**
   * 左ナビゲーション（最も狭い）
   * @description アイコンナビ・ワークスペース切替
   */
  nav: {
    // 幅バリエーション
    default: 'w-16',        // 64px - アイコンのみ ✅
    expanded: 'w-20',       // 80px - 少し広め
    
    // スタイル
    style: 'bg-neutral-900 dark:bg-neutral-950 text-white',
    
    // 内容
    content: {
      item: 'w-12 h-12 flex items-center justify-center rounded-lg hover:bg-neutral-800',
      itemActive: 'bg-blue-600',
      divider: 'mx-3 my-2 border-t border-neutral-700',
    },
  },
  
  /**
   * 中央サイドバー（中サイズ）
   * @description リスト・ナビゲーション詳細
   */
  sidebar: {
    // 幅バリエーション
    narrow: 'w-56',         // 224px - 狭め
    default: 'w-64',        // 256px - 標準 ✅
    wide: 'w-72',          // 288px - 広め
    extraWide: 'w-80',     // 320px - 最大
    
    // スタイル
    style: 'bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
    
    // パディング
    padding: 'p-4',
    
    // 内容構造
    content: {
      header: 'mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-700',
      scrollArea: 'h-[calc(100vh-8rem)] overflow-y-auto',
      section: 'mb-6',
      sectionTitle: 'text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2',
      item: 'py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer',
      itemActive: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
  },
  
  /**
   * 右メインコンテンツ（最も広い）
   * @description メインの作業エリア
   */
  main: {
    // フレックスで残り全部を取る
    default: 'flex-1',
    
    // 最小幅を確保（コンテンツが潰れないように）
    minWidth: 'min-w-[600px]',
    
    // スタイル
    style: 'bg-white dark:bg-neutral-950',
    
    // パディング
    padding: {
      sm: 'p-4',           // 16px
      md: 'p-6',           // 24px ✅
      lg: 'p-8',           // 32px
      xl: 'p-10',          // 40px
    },
    
    // 内容構造
    content: {
      header: 'mb-6',
      title: 'text-2xl font-bold mb-2',
      breadcrumb: 'text-sm text-neutral-500 mb-4',
      container: 'max-w-6xl',  // コンテンツ最大幅
    },
  },
} as const

// ============================================
// BoxLog レイアウトパターン
// ============================================

export const layoutPatterns = {
  /**
   * フル3カラム
   * @usage デフォルトのアプリレイアウト
   */
  default: {
    wrapper: 'flex h-screen overflow-hidden',
    nav: `${columns.nav.default} ${columns.nav.style} flex-shrink-0`,
    sidebar: `${columns.sidebar.default} ${columns.sidebar.style} flex-shrink-0`,
    main: `${columns.main.default} ${columns.main.style} ${columns.main.padding.md} overflow-auto`,
  },
  
  /**
   * 2カラム（ナビ + メイン）
   * @usage サイドバー不要時
   */
  withoutSidebar: {
    wrapper: 'flex h-screen overflow-hidden',
    nav: `${columns.nav.default} ${columns.nav.style} flex-shrink-0`,
    main: `${columns.main.default} ${columns.main.style} ${columns.main.padding.md} overflow-auto`,
  },
  
  /**
   * レスポンシブ対応
   * @usage モバイル・タブレット対応
   */
  responsive: {
    wrapper: 'flex h-screen overflow-hidden',
    
    // ナビ：常に表示（モバイルでも）
    nav: 'w-16 bg-neutral-900 dark:bg-neutral-950 flex-shrink-0',
    
    // サイドバー：モバイルで非表示、タブレット以上で表示
    sidebar: 'hidden md:block w-64 bg-neutral-50 dark:bg-neutral-900 border-r flex-shrink-0',
    
    // メイン：常に残り全部
    main: 'flex-1 bg-white dark:bg-neutral-950 p-4 md:p-6 overflow-auto',
    
    // モバイル用オーバーレイサイドバー
    sidebarMobile: 'fixed inset-y-0 left-16 w-64 z-40 md:relative md:left-0',
  },
} as const

// ============================================
// 実装用ヘルパー
// ============================================

export const layoutHelpers = {
  /**
   * サイドバーの開閉
   */
  sidebarToggle: {
    // 開いている時
    open: {
      sidebar: 'translate-x-0',
      overlay: 'block',
    },
    // 閉じている時
    closed: {
      sidebar: '-translate-x-full md:translate-x-0',
      overlay: 'hidden',
    },
    // オーバーレイ
    overlay: 'fixed inset-0 bg-black/50 z-30 md:hidden',
  },
  
  /**
   * リサイズ可能な境界線
   */
  resizer: {
    vertical: 'w-px hover:w-1 bg-neutral-200 hover:bg-blue-500 cursor-col-resize transition-all',
  },
  
  /**
   * 幅の配分情報
   */
  widthDistribution: {
    // 合計幅を100%とした場合
    nav: "64px (固定)",      // 約4%
    sidebar: "256px (固定)",  // 約15%
    main: "残り全部",         // 約81%
    
    // 1920pxディスプレイの場合
    navActual: "64px",
    sidebarActual: "256px",
    mainActual: "1600px",    // たっぷり！
  },
  
  /**
   * BoxLogの3カラム原則
   */
  principles: {
    // 役割
    左ナビ: "アイコンのみ・高速切替",
    中サイドバー: "リスト・フィルター・ツリー",
    右メイン: "作業エリア・詳細表示",
    
    // サイズ
    ratio: "64px : 256px : 残り全部",
    
    // 色分け
    左: "ダーク（neutral-900）",
    中: "ライトグレー（neutral-50）",
    右: "白（white）",
    
    note: "これでUIに階層感が生まれる！",
  },
} as const

// ============================================
// レスポンシブ対応
// ============================================

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

// ============================================
// Z-Index システム（階層管理）
// ============================================

/**
 * Z-Index システム
 * @description UI要素の重ね順を統一管理
 */
export const zIndex = {
  /**
   * 基底レベル（通常コンテンツ）
   */
  base: 0,
  
  /**
   * 軽微な浮上（カードホバーなど）
   */
  raised: 10,
  
  /**
   * ドロップダウン・ツールチップ
   */
  dropdown: 100,
  
  /**
   * スティッキー要素（ヘッダー、サイドバー）
   */
  sticky: 200,
  
  /**
   * 固定要素（ナビゲーション）
   */
  fixed: 300,
  
  /**
   * オーバーレイ背景
   */
  overlay: 400,
  
  /**
   * モーダル・ダイアログ
   */
  modal: 500,
  
  /**
   * ポップオーバー（モーダル上）
   */
  popover: 600,
  
  /**
   * トースト・通知
   */
  toast: 700,
  
  /**
   * ツールチップ（最前面）
   */
  tooltip: 800,
  
  /**
   * デバッグ・開発ツール
   */
  debug: 9999,
} as const

/**
 * Z-Index用のTailwindクラス
 */
export const zIndexClasses = {
  base: 'z-0',
  raised: 'z-10',
  dropdown: 'z-[100]',
  sticky: 'z-[200]',
  fixed: 'z-[300]',
  overlay: 'z-[400]',
  modal: 'z-[500]',
  popover: 'z-[600]',
  toast: 'z-[700]',
  tooltip: 'z-[800]',
  debug: 'z-[9999]',
} as const

/**
 * コンポーネント別Z-Index
 */
export const componentZIndex = {
  /**
   * ナビゲーション関連
   */
  navigation: {
    sidebar: zIndexClasses.fixed,      // 固定サイドバー
    dropdown: zIndexClasses.dropdown,  // ドロップダウンメニュー
    breadcrumb: zIndexClasses.base,    // パンくずリスト
  },
  
  /**
   * モーダル関連
   */
  modal: {
    backdrop: zIndexClasses.overlay,   // 背景オーバーレイ
    content: zIndexClasses.modal,      // モーダル本体
    closeButton: zIndexClasses.popover, // 閉じるボタン
  },
  
  /**
   * フィードバック関連
   */
  feedback: {
    toast: zIndexClasses.toast,        // トースト通知
    tooltip: zIndexClasses.tooltip,    // ツールチップ
    notification: zIndexClasses.toast, // システム通知
  },
  
  /**
   * インタラクション関連
   */
  interactive: {
    cardHover: zIndexClasses.raised,   // カードホバー
    dropdown: zIndexClasses.dropdown,  // ドロップダウン
    popover: zIndexClasses.popover,    // ポップオーバー
  },
} as const

/**
 * レスポンシブコンテナ
 * @description 画面サイズに応じたコンテナ
 */
export const responsiveContainer = {
  /**
   * 基本コンテナ
   * @usage 一般的なコンテンツ
   */
  base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  
  /**
   * 最大幅制限付きコンテナ
   */
  withMaxWidth: {
    sm: 'w-full max-w-2xl mx-auto px-4 sm:px-6',
    md: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    lg: 'w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
    xl: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },
  
  /**
   * セクション用コンテナ
   */
  section: 'w-full mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16',
} as const

// ============================================
// フレックスボックスパターン
// ============================================

/**
 * よく使うFlexboxパターン
 */
export const flexPatterns = {
  /**
   * 中央配置
   */
  center: 'flex items-center justify-center',
  
  /**
   * 縦中央・横左
   */
  centerLeft: 'flex items-center justify-start',
  
  /**
   * 縦中央・横右
   */
  centerRight: 'flex items-center justify-end',
  
  /**
   * 上下中央・左右均等配置
   */
  spaceBetween: 'flex items-center justify-between',
  
  /**
   * 縦方向のスタック
   */
  columnCenter: 'flex flex-col items-center justify-center',
  
  /**
   * 縦方向のスタック（上寄せ）
   */
  columnTop: 'flex flex-col items-center justify-start',
  
  /**
   * インライン要素の配置
   */
  inline: 'flex items-center space-x-2',
  
  /**
   * ラップ対応の水平配置
   */
  wrap: 'flex flex-wrap items-center gap-2',
} as const

// ============================================
// グリッドパターン
// ============================================

/**
 * 拡張グリッドパターン
 */
export const gridPatterns = {
  /**
   * カードグリッド
   */
  cards: {
    sm: 'grid grid-cols-1 gap-4',
    md: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    lg: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    xl: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  },
  
  /**
   * サイドバー付きレイアウト
   */
  sidebar: {
    left: 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6',
    right: 'grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6',
    wide: 'grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8',
  },
  
  /**
   * ダッシュボード用
   */
  dashboard: {
    twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    threeColumn: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    mixed: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
  },
  
  /**
   * フォーム用
   */
  form: {
    single: 'grid grid-cols-1 gap-4',
    double: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    mixed: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  },
} as const

// ============================================
// ユーティリティ関数
// ============================================

/**
 * レイアウトユーティリティ
 */
export const layoutUtils = {
  /**
   * コンテナサイズを取得
   */
  getContainer: (size: keyof typeof layout.container): string => {
    return layout.container[size]
  },
  
  /**
   * グリッドパターンを取得
   */
  getGrid: (pattern: keyof typeof layout.grid): string => {
    return layout.grid[pattern]
  },
  
  /**
   * レスポンシブコンテナを取得
   */
  getResponsiveContainer: (
    type: 'base' | 'section' | keyof typeof responsiveContainer.withMaxWidth,
    maxWidth?: keyof typeof responsiveContainer.withMaxWidth
  ): string => {
    if (type === 'base') return responsiveContainer.base
    if (type === 'section') return responsiveContainer.section
    if (maxWidth && type in responsiveContainer.withMaxWidth) {
      return responsiveContainer.withMaxWidth[type as keyof typeof responsiveContainer.withMaxWidth]
    }
    return responsiveContainer.base
  },
  
  /**
   * Flexパターンを取得
   */
  getFlex: (pattern: keyof typeof flexPatterns): string => {
    return flexPatterns[pattern]
  },
  
  /**
   * グリッドパターンを取得（拡張版）
   */
  getGridPattern: (
    category: keyof typeof gridPatterns,
    variant: string
  ): string => {
    const patterns = gridPatterns[category]
    if (typeof patterns === 'string') return patterns
    return patterns[variant as keyof typeof patterns] || patterns[Object.keys(patterns)[0] as keyof typeof patterns]
  },
} as const

// ============================================
// 使用例
// ============================================

/**
 * 実装例
 * @example
 * ```tsx
 * import { 
 *   layout, 
 *   layoutUtils, 
 *   flexPatterns, 
 *   gridPatterns, 
 *   columns, 
 *   layoutPatterns 
 * } from '@/config/theme/layout'
 * 
 * // ============================================
 * // BoxLog 3カラムレイアウト
 * // ============================================
 * 
 * function BoxLogApp() {
 *   return (
 *     <div className={layoutPatterns.default.wrapper}>
 *       // 左：ナビゲーション（狭い）}
 *       <nav className={layoutPatterns.default.nav}>
 *         <div className="py-4 space-y-2">
 *           <button className={columns.nav.content.item}>
 *             <Home className="w-5 h-5" />
 *           </button>
 *           <button className={`${columns.nav.content.item} ${columns.nav.content.itemActive}`}>
 *             <Calendar className="w-5 h-5" />
 *           </button>
 *           <button className={columns.nav.content.item}>
 *             <Settings className="w-5 h-5" />
 *           </button>
 *         </div>
 *       </nav>
 *       
 *       // 中：サイドバー（中サイズ）}
 *       <aside className={layoutPatterns.default.sidebar}>
 *         <div className={columns.sidebar.padding}>
 *           <header className={columns.sidebar.content.header}>
 *             <h2 className="font-semibold">プロジェクト</h2>
 *           </header>
 *           <div className={columns.sidebar.content.scrollArea}>
 *             <div className={columns.sidebar.content.section}>
 *               <div className={columns.sidebar.content.sectionTitle}>
 *                 お気に入り
 *               </div>
 *               <div className={columns.sidebar.content.item}>
 *                 今日のタスク
 *               </div>
 *               <div className={`${columns.sidebar.content.item} ${columns.sidebar.content.itemActive}`}>
 *                 今週の予定
 *               </div>
 *             </div>
 *           </div>
 *         </div>
 *       </aside>
 *       
 *       // 右：メインコンテンツ（広い）}
 *       <main className={layoutPatterns.default.main}>
 *         <header className={columns.main.content.header}>
 *           <h1 className={columns.main.content.title}>
 *             今週の予定
 *           </h1>
 *           <div className={columns.main.content.breadcrumb}>
 *             ホーム / カレンダー / 今週
 *           </div>
 *         </header>
 *         
 *         <div className={columns.main.content.container}>
 *           // メインコンテンツ
 *         </div>
 *       </main>
 *     </div>
 *   )
 * }
 * 
 * // ============================================
 * // 従来のレイアウト例
 * // ============================================
 * 
 * // 基本コンテナ
 * <div className={layout.container.medium}>
 *   コンテンツ
 * </div>
 * 
 * // レスポンシブコンテナ
 * <div className={layoutUtils.getResponsiveContainer('base')}>
 *   レスポンシブコンテンツ
 * </div>
 * 
 * // カードグリッド
 * <div className={gridPatterns.cards.lg}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </div>
 * 
 * // 中央配置
 * <div className={flexPatterns.center}>
 *   <button>ボタン</button>
 * </div>
 * 
 * // サイドバーレイアウト
 * <div className={gridPatterns.sidebar.left}>
 *   <aside>サイドバー</aside>
 *   <main>メインコンテンツ</main>
 * </div>
 * ```
 */

export default layout