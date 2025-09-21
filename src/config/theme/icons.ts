/**
 * BoxLog アイコンシステム
 * Lucide Reactベース・8pxグリッド準拠
 */

// ============================================
// アイコンサイズ（8pxグリッド準拠）
// ============================================

export const icon = {
  /**
   * サイズ定義
   * @description 用途別のアイコンサイズ
   */
  size: {
    /**
     * 12px: 極小
     * @usage インラインテキスト内の装飾
     * @example 外部リンクアイコン
     */
    xs: 'w-3 h-3',  // 12px
    
    /**
     * 16px: 小
     * @usage ボタン内、リスト項目
     * @example チェックマーク、矢印
     */
    sm: 'w-4 h-4',  // 16px ✅
    
    /**
     * 20px: 標準
     * @usage 通常のアイコン
     * @example ナビゲーション、アクション
     */
    md: 'w-5 h-5',  // 20px（デフォルト）
    
    /**
     * 24px: 大
     * @usage 強調したいアイコン
     * @example モーダルのアイコン、空状態
     */
    lg: 'w-6 h-6',  // 24px ✅
    
    /**
     * 32px: 特大
     * @usage イラスト的な使用
     * @example エラーページ、成功画面
     */
    xl: 'w-8 h-8',  // 32px ✅
    
    /**
     * 48px: 最大
     * @usage ヒーローアイコン
     * @example 空状態のイラスト
     */
    '2xl': 'w-12 h-12',  // 48px ✅
  },
  
  /**
   * アイコンの色
   * @description 状態や用途別の色
   */
  color: {
    // 基本
    default: 'text-neutral-600 dark:text-neutral-400',
    primary: 'text-blue-600 dark:text-blue-400',
    muted: 'text-neutral-400 dark:text-neutral-600',
    
    // 状態
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    
    // インタラクティブ
    hover: 'hover:text-blue-600 dark:hover:text-blue-400',
    disabled: 'text-neutral-300 dark:text-neutral-700',
    
    // コントラスト（背景色付きアイコン用）
    inverse: 'text-white dark:text-neutral-900',
  },
  
  /**
   * アニメーション
   * @description アイコンの動き
   */
  animation: {
    spin: 'animate-spin',           // ローディング
    pulse: 'animate-pulse',          // 注目
    bounce: 'animate-bounce',        // 通知
    none: '',                        // なし
  },
} as const

// ============================================
// アイコン配置パターン
// ============================================

export const iconPatterns = {
  /**
   * ボタン内のアイコン
   * @description アイコンとテキストの組み合わせ
   */
  button: {
    // アイコンのみ
    iconOnly: 'p-2',
    iconOnlyLarge: 'p-3',  // 大きめボタン用
    
    // アイコン + テキスト（左）
    withTextLeft: 'inline-flex items-center gap-2',
    iconLeft: `${icon.size.sm} -ml-0.5`,  // 微調整
    
    // アイコン + テキスト（右）
    withTextRight: 'inline-flex items-center gap-2 flex-row-reverse',
    iconRight: `${icon.size.sm} -mr-0.5`,
    
    // 小さいボタン用
    small: {
      withTextLeft: 'inline-flex items-center gap-1.5',
      iconLeft: `${icon.size.xs}`,
    },
    
    // 大きいボタン用
    large: {
      withTextLeft: 'inline-flex items-center gap-3',
      iconLeft: `${icon.size.md}`,
    },
  },
  
  /**
   * リスト内のアイコン
   * @description リスト項目の装飾
   */
  list: {
    // チェックリスト
    check: `${icon.size.sm} ${icon.color.success} mr-2`,
    
    // 矢印リスト
    arrow: `${icon.size.sm} ${icon.color.muted} mr-2`,
    
    // ナンバリング代替
    number: `${icon.size.md} ${icon.color.primary} mr-3`,
    
    // エラーアイコン
    error: `${icon.size.sm} ${icon.color.error} mr-2`,
    
    // 情報アイコン
    info: `${icon.size.sm} ${icon.color.info} mr-2`,
    
    // リスト行全体のレイアウト
    item: 'flex items-center',
    itemStart: 'flex items-start',  // 複数行テキスト用
  },
  
  /**
   * 入力フィールドのアイコン
   * @description フォーム要素の装飾
   */
  input: {
    // 左側アイコン
    left: 'absolute left-3 top-1/2 -translate-y-1/2',
    leftLarge: 'absolute left-4 top-1/2 -translate-y-1/2',
    
    // 右側アイコン
    right: 'absolute right-3 top-1/2 -translate-y-1/2',
    rightLarge: 'absolute right-4 top-1/2 -translate-y-1/2',
    
    // サイズとスタイル
    size: `${icon.size.sm} ${icon.color.muted}`,
    sizeInteractive: `${icon.size.sm} ${icon.color.muted} ${icon.color.hover} cursor-pointer`,
    
    // フィールドとの組み合わせ
    fieldWithLeftIcon: 'pl-10',  // アイコン分の余白
    fieldWithRightIcon: 'pr-10',
  },
  
  /**
   * 空状態
   * @description データがない時の表示
   */
  empty: {
    wrapper: 'flex flex-col items-center gap-4 py-12',
    wrapperCompact: 'flex flex-col items-center gap-3 py-8',
    icon: `${icon.size['2xl']} ${icon.color.muted}`,
    iconLarge: `w-16 h-16 ${icon.color.muted}`,  // 64px
    text: 'text-center',
  },
  
  /**
   * 通知・バッジ
   * @description ステータス表示
   */
  status: {
    // 成功
    success: `${icon.size.sm} ${icon.color.success}`,
    successLarge: `${icon.size.md} ${icon.color.success}`,
    
    // エラー
    error: `${icon.size.sm} ${icon.color.error}`,
    errorLarge: `${icon.size.md} ${icon.color.error}`,
    
    // 警告
    warning: `${icon.size.sm} ${icon.color.warning}`,
    warningLarge: `${icon.size.md} ${icon.color.warning}`,
    
    // 情報
    info: `${icon.size.sm} ${icon.color.info}`,
    infoLarge: `${icon.size.md} ${icon.color.info}`,
    
    // インライン（テキストと同じ行）
    inline: 'inline-flex items-center gap-1.5',
  },
  
  /**
   * ナビゲーション
   * @description メニューやタブで使用
   */
  navigation: {
    // メニュー項目
    menuItem: `${icon.size.md} ${icon.color.default} mr-3`,
    menuItemActive: `${icon.size.md} ${icon.color.primary} mr-3`,
    
    // タブ
    tab: `${icon.size.sm} ${icon.color.muted}`,
    tabActive: `${icon.size.sm} ${icon.color.primary}`,
    
    // ブレッドクラム
    breadcrumb: `${icon.size.xs} ${icon.color.muted} mx-2`,
  },
  
  /**
   * カード
   * @description カードコンポーネント内での使用
   */
  card: {
    // カードヘッダー
    header: `${icon.size.lg} ${icon.color.primary} mb-2`,
    headerMuted: `${icon.size.lg} ${icon.color.muted} mb-2`,
    
    // カードアクション
    action: `${icon.size.sm} ${icon.color.muted} ${icon.color.hover}`,
    
    // カードメタ情報
    meta: `${icon.size.xs} ${icon.color.muted} mr-1`,
  },
} as const

// ============================================
// よく使うアイコンの定義
// ============================================

/**
 * 頻出アイコンのインポート例
 * @description Lucide Reactから
 */
export const commonIcons = {
  // ナビゲーション
  menu: 'Menu',
  close: 'X',
  home: 'Home',
  settings: 'Settings',
  dashboard: 'LayoutDashboard',
  
  // アクション
  add: 'Plus',
  edit: 'Pencil',
  delete: 'Trash2',
  save: 'Save',
  copy: 'Copy',
  share: 'Share',
  download: 'Download',
  upload: 'Upload',
  
  // 状態
  check: 'Check',
  error: 'AlertCircle',
  warning: 'AlertTriangle',
  info: 'Info',
  help: 'HelpCircle',
  loading: 'Loader2',
  
  // 方向・ナビゲーション
  up: 'ChevronUp',
  down: 'ChevronDown',
  left: 'ChevronLeft',
  right: 'ChevronRight',
  back: 'ArrowLeft',
  forward: 'ArrowRight',
  
  // ユーティリティ
  calendar: 'Calendar',
  clock: 'Clock',
  user: 'User',
  users: 'Users',
  search: 'Search',
  filter: 'Filter',
  sort: 'ArrowUpDown',
  refresh: 'RefreshCw',
  
  // ファイル・データ
  file: 'File',
  folder: 'Folder',
  image: 'Image',
  document: 'FileText',
  
  // コミュニケーション
  mail: 'Mail',
  message: 'MessageCircle',
  phone: 'Phone',
  
  // その他
  heart: 'Heart',
  star: 'Star',
  bookmark: 'Bookmark',
  tag: 'Tag',
  lock: 'Lock',
  unlock: 'Unlock',
  eye: 'Eye',
  eyeOff: 'EyeOff',
  more: 'MoreHorizontal',
  moreVertical: 'MoreVertical',
} as const

// ============================================
// ユーティリティ関数
// ============================================

/**
 * アイコンのクラスを組み合わせるヘルパー関数
 */
export const iconUtils = {
  /**
   * ボタンアイコンのスタイルを取得
   */
  getButtonIcon: (
    size: 'small' | 'default' | 'large' = 'default',
    position: 'left' | 'right' | 'only' = 'left'
  ): string => {
    if (position === 'only') {
      return size === 'large' ? iconPatterns.button.iconOnlyLarge : iconPatterns.button.iconOnly
    }
    
    const baseClass = position === 'right' 
      ? iconPatterns.button.withTextRight 
      : iconPatterns.button.withTextLeft
      
    const iconClass = position === 'right' 
      ? iconPatterns.button.iconRight 
      : iconPatterns.button.iconLeft
      
    if (size === 'small') {
      return `${iconPatterns.button.small.withTextLeft} ${iconPatterns.button.small.iconLeft}`
    }
    if (size === 'large') {
      return `${iconPatterns.button.large.withTextLeft} ${iconPatterns.button.large.iconLeft}`
    }
    
    return `${baseClass} ${iconClass}`
  },
  
  /**
   * ステータスアイコンのスタイルを取得
   */
  getStatusIcon: (
    status: 'success' | 'error' | 'warning' | 'info',
    size: 'small' | 'large' = 'small'
  ): string => {
    const statusKey = size === 'large' ? `${status}Large` : status
    return iconPatterns.status[statusKey as keyof typeof iconPatterns.status as keyof typeof status]
  },
  
  /**
   * アニメーション付きアイコンのスタイルを取得
   */
  getAnimatedIcon: (
    size: keyof typeof icon.size,
    animation: keyof typeof icon.animation,
    color: keyof typeof icon.color = 'default'
  ): string => {
    return `${icon.size[size as keyof typeof size]} ${icon.color[color as keyof typeof color]} ${icon.animation[animation as keyof typeof animation]}`
  },
  
  /**
   * 入力フィールドアイコンのスタイルを取得
   */
  getInputIcon: (
    position: 'left' | 'right' = 'left',
    interactive: boolean = false
  ): string => {
    const positionClass = iconPatterns.input[position as keyof typeof input]
    const sizeClass = interactive 
      ? iconPatterns.input.sizeInteractive 
      : iconPatterns.input.size
    return `${positionClass} ${sizeClass}`
  },
} as const

// ============================================
// 使用例とベストプラクティス
// ============================================

/**
 * 実装例
 * @example
 * ```tsx
 * import { Check, Plus, Trash2, Loader2, Calendar } from 'lucide-react'
 * import { icon, iconPatterns, iconUtils } from '@/config/theme/icons'
 * 
 * // ボタン with アイコン
 * <button className={iconPatterns.button.withTextLeft}>
 *   <Plus className={iconPatterns.button.iconLeft} />
 *   新規作成
 * </button>
 * 
 * // アイコンのみボタン
 * <button className={iconPatterns.button.iconOnly}>
 *   <Trash2 className={icon.size.md} />
 * </button>
 * 
 * // リストアイテム
 * <li className={iconPatterns.list.item}>
 *   <Check className={iconPatterns.list.check} />
 *   完了したタスク
 * </li>
 * 
 * // ローディング
 * <Loader2 className={iconUtils.getAnimatedIcon('md', 'spin')} />
 * 
 * // 空状態
 * <div className={iconPatterns.empty.wrapper}>
 *   <Calendar className={iconPatterns.empty.icon} />
 *   <p className={iconPatterns.empty.text}>予定がありません</p>
 * </div>
 * 
 * // ステータス表示
 * <div className={iconPatterns.status.inline}>
 *   <Check className={iconUtils.getStatusIcon('success')} />
 *   <span>正常に保存されました</span>
 * </div>
 * 
 * // 入力フィールド with アイコン
 * <div className="relative">
 *   <Search className={iconUtils.getInputIcon('left')} />
 *   <input className={`pl-10 ${iconPatterns.input.fieldWithLeftIcon}`} />
 * </div>
 * ```
 */

/**
 * サイズ選択ガイド
 * @description どのサイズを使うべきか
 */
export const IconSizeGuide = {
  xs: 'インラインテキスト内、メタ情報',
  sm: 'ボタン内、リスト項目、入力フィールド',
  md: '通常のUI、ナビゲーション（デフォルト）',
  lg: '強調したいアイコン、モーダル、カードヘッダー',
  xl: 'イラスト的使用、エラーページ',
  '2xl': '空状態、ヒーローセクション',
} as const

/**
 * アクセシビリティガイド
 * @description アイコン使用時の注意点
 */
export const AccessibilityGuide = {
  decorative: 'aria-hidden="true" を追加（装飾目的）',
  interactive: 'aria-label を追加（クリック可能）',
  informational: 'title または aria-describedby を追加（情報提供）',
  loading: 'aria-live="polite" と組み合わせ（状態変化）',
} as const

// ============================================
// エクスポート統合
// ============================================

export const icons = {
  ...icon,
  patterns: iconPatterns,
  common: commonIcons,
  utils: iconUtils,
  guide: {
    size: IconSizeGuide,
    accessibility: AccessibilityGuide,
  },
} as const

export default icons