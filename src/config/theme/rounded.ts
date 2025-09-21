/**
 * BoxLog 境界線・角丸・影システム
 * 8pxグリッド準拠・統一感重視
 * @description モダンでバランスの良い印象を実現
 */

// ============================================
// 基本の角丸定義（8pxグリッド準拠）
// ============================================

export const radius = {
  /**
   * none: 角なし（0px）
   * @usage 真面目・堅い印象を出したい時
   * @example データテーブル、グラフ、エンタープライズ系
   */
  none: 'rounded-none',  // 0px
  
  /**
   * xs: 極小（2px）
   * @usage ほんの少しだけ柔らかく
   * @example インラインタグ、小さなバッジ、リストアイテム
   */
  xs: 'rounded-[2px]',  // 2px
  
  /**
   * sm: 小（4px）
   * @usage 控えめな角丸
   * @example ボタン、インプット、チップ、小さなカード
   */
  sm: 'rounded',  // 4px (Tailwind default)
  
  /**
   * md: 中（8px）✅ BoxLog標準
   * @usage 標準的な角丸（最も使用頻度が高い）
   * @example ボタン、カード、モーダル、ドロップダウン
   */
  md: 'rounded-lg',  // 8px ✅ BoxLogメイン
  
  /**
   * lg: 大（12px）
   * @usage 柔らかい印象
   * @example 大きなカード、セクション、パネル
   */
  lg: 'rounded-xl',  // 12px ← カスタマイズ推奨
  
  /**
   * xl: 特大（16px）
   * @usage より柔らかく、親しみやすく
   * @example ヒーローセクション、大きなパネル、モーダル
   */
  xl: 'rounded-2xl',  // 16px ← カスタマイズ推奨
  
  /**
   * 2xl: 超特大（24px）
   * @usage かなり丸い、フレンドリー
   * @example 特別なカード、イラスト的要素、CTA
   */
  '2xl': 'rounded-3xl',  // 24px ← カスタマイズ推奨
  
  /**
   * full: 完全な丸（9999px）
   * @usage 円形にしたい
   * @example アバター、丸ボタン、ピル型ボタン、バッジ
   */
  full: 'rounded-full',  // 9999px
} as const

// ============================================
// BoxLog統一ルール（8の倍数または4px）
// ============================================

/**
 * BoxLogで推奨する角丸設定
 * @description 8pxグリッドに準拠した統一ルール
 */
export const boxlogRadius = {
  /**
   * 基本方針: 8px (md) をメインに使用 ✅
   */
  standard: radius.md,  // 8px - これをメインに
  
  /**
   * 階層ルール: 外側ほど丸く、内側ほど角ばる
   */
  hierarchy: {
    level1: radius.lg,     // 最外側：12px (大きなコンテナ)
    level2: radius.md,     // 中間層：8px (標準) ✅
    level3: radius.sm,     // 最内側：4px (小さな要素)
  },
  
  /**
   * サイズ連動ルール: 要素が大きいほど角丸も大きく
   */
  sizeRelation: {
    xs: radius.sm,   // 極小要素：4px
    sm: radius.md,   // 小要素：8px ✅
    md: radius.md,   // 中要素：8px ✅
    lg: radius.lg,   // 大要素：12px
    xl: radius.xl,   // 特大要素：16px
  },
  
  /**
   * 機能別ルール: 用途で角丸を決める
   */
  functional: {
    clickable: radius.md,      // クリック可能：8px ✅
    display: radius.lg,        // 表示のみ：12px
    input: radius.md,          // 入力系：8px ✅
    decorative: radius.full,   // 装飾：円形
    data: radius.sm,           // データ表示：4px
  },
} as const

// ============================================
// コンポーネント別の角丸
// ============================================

export const componentRadius = {
  /**
   * ボタンの角丸
   * @description サイズ別の最適な角丸
   */
  button: {
    sm: radius.sm,      // 小ボタン → 4px
    md: radius.md,      // 標準 → 8px ✅ BoxLogメイン
    lg: radius.md,      // 大ボタン → 8px (一貫性重視)
    pill: radius.full,  // ピル型 → full
    icon: radius.md,    // アイコンボタン → 8px
  },
  
  /**
   * カードの角丸
   * @description 階層別の角丸（外側ほど大きく）
   */
  card: {
    base: radius.lg,        // 基本カード → 12px ✅
    nested: radius.md,      // 入れ子カード → 8px ✅
    compact: radius.md,     // コンパクトカード → 8px
    hover: radius.lg,       // ホバー時も同じ → 12px
    hero: radius.xl,        // ヒーローカード → 16px
    md: radius.md,          // 中サイズカード → 8px （エイリアス）
  },
  
  /**
   * 入力フォームの角丸
   * @description 統一感のある角丸
   */
  input: {
    text: radius.md,        // テキスト入力 → 8px ✅
    textarea: radius.md,    // テキストエリア → 8px
    select: radius.md,      // セレクト → 8px
    checkbox: radius.sm,    // チェックボックス → 4px
    radio: radius.full,     // ラジオ → 円形
    search: radius.full,    // 検索ボックス → ピル型
    sm: radius.sm,          // 小サイズ入力 → 4px （エイリアス）
  },
  
  /**
   * モーダル・ダイアログ
   * @description 大きめの角丸で柔らかく
   */
  modal: {
    container: radius.xl,   // モーダル本体 → 16px ✅
    header: 'rounded-t-2xl', // 上部のみ → 16px
    footer: 'rounded-b-2xl', // 下部のみ → 16px
    small: radius.lg,       // 小さなモーダル → 12px
    large: radius.xl,       // 大きなモーダル → 16px
  },
  
  /**
   * バッジ・タグ
   * @description 小さい要素の角丸
   */
  badge: {
    default: radius.sm,     // 通常 → 4px
    pill: radius.full,      // ピル型 → full ✅
    square: radius.xs,      // 角ばった → 2px
    status: radius.full,    // ステータス → 円形
  },
  
  /**
   * 画像・メディア
   * @description コンテンツタイプ別
   */
  media: {
    thumbnail: radius.md,   // サムネイル → 8px
    avatar: radius.full,    // アバター → 円形 ✅
    preview: radius.lg,     // プレビュー → 12px
    hero: radius.xl,        // ヒーロー画像 → 16px
    gallery: radius.md,     // ギャラリー → 8px
  },
  
  /**
   * ナビゲーション
   * @description メニューやタブの角丸
   */
  navigation: {
    tab: radius.md,         // タブ → 8px
    pill: radius.full,      // ピル型タブ → full
    menu: radius.md,        // メニュー → 8px
    dropdown: radius.lg,    // ドロップダウン → 12px
  },
  
  /**
   * データ表示
   * @description テーブルやリストの角丸
   */
  data: {
    table: radius.sm,       // テーブル → 4px
    row: radius.sm,         // 行 → 4px
    cell: radius.xs,        // セル → 2px
    list: radius.md,        // リスト → 8px
  },
} as const

// ============================================
// 特殊な角丸パターン
// ============================================

export const specialRadius = {
  /**
   * 片側だけ角丸
   * @usage 接続された要素、グルーピング
   */
  sided: {
    // 標準サイズ（8px）
    top: 'rounded-t-lg',          // 上だけ
    bottom: 'rounded-b-lg',       // 下だけ
    left: 'rounded-l-lg',         // 左だけ
    right: 'rounded-r-lg',        // 右だけ
    
    // 各角個別
    topLeft: 'rounded-tl-lg',     // 左上だけ
    topRight: 'rounded-tr-lg',    // 右上だけ
    bottomLeft: 'rounded-bl-lg',  // 左下だけ
    bottomRight: 'rounded-br-lg', // 右下だけ
  },
  
  /**
   * 大きめの片側角丸（12px）
   * @usage 大きなコンポーネント用
   */
  sidedLarge: {
    top: 'rounded-t-xl',          // 上だけ
    bottom: 'rounded-b-xl',       // 下だけ
    left: 'rounded-l-xl',         // 左だけ
    right: 'rounded-r-xl',        // 右だけ
  },
  
  /**
   * 内側の角丸（インセット）
   * @usage オーバーレイ、フォーカスリング、境界線内側
   */
  inset: {
    sm: 'rounded-[3px]',   // 外側4pxより1px小さく
    md: 'rounded-[7px]',   // 外側8pxより1px小さく
    lg: 'rounded-[11px]',  // 外側12pxより1px小さく
  },
  
  /**
   * アニメーション用
   * @usage ホバーで角丸変化
   */
  hover: {
    toRounded: 'hover:rounded-lg transition-all duration-200',
    toSquare: 'hover:rounded-none transition-all duration-200',
    toPill: 'hover:rounded-full transition-all duration-200',
    subtle: 'hover:rounded-xl transition-all duration-200',
  },
  
  /**
   * グルーピング用
   * @usage 複数要素を視覚的にグループ化
   */
  group: {
    first: 'rounded-l-lg rounded-r-none',     // 最初の要素
    middle: 'rounded-none',                   // 中間の要素
    last: 'rounded-r-lg rounded-l-none',      // 最後の要素
    single: 'rounded-lg',                     // 単独要素
  },
} as const

// ============================================
// 印象とブランディング
// ============================================

/**
 * 角丸による印象の違い
 * @description どんな印象を与えるか
 */
export const radiusImpression = {
  "0px (none)": {
    impression: "プロフェッショナル、真面目、堅い、信頼感",
    usage: "ビジネス系、データ系、エンタープライズ、金融",
    examples: "Excel、銀行アプリ、管理画面"
  },
  
  "4-8px (sm-md)": {
    impression: "モダン、バランス良い、親しみやすい、実用的", // ✅ BoxLog
    usage: "一般的なWebアプリ、SaaS、プロダクティビティ",
    examples: "Notion、Slack、Linear、BoxLog ✅"
  },
  
  "12-16px (lg-xl)": {
    impression: "フレンドリー、カジュアル、優しい、親近感",
    usage: "コンシューマー向け、SNS、コミュニティ",
    examples: "Twitter、Instagram、Medium"
  },
  
  "24px+ (2xl)": {
    impression: "遊び心、ポップ、若々しい、クリエイティブ",
    usage: "ゲーム、子供向け、エンターテイメント",
    examples: "Discord、Figma、クリエイティブツール"
  },
} as const

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 角丸のユーティリティ関数
 */
export const radiusUtils = {
  /**
   * コンポーネントの角丸を取得
   */
  getComponentRadius: (
    component: keyof typeof componentRadius,
    variant: string = 'default'
  ): string => {
    const comp = componentRadius[component]
    if (typeof comp === 'string') return comp
    return comp[variant as keyof typeof comp] || comp['default' as keyof typeof comp] || radius.md
  },
  
  /**
   * 階層に応じた角丸を取得
   */
  getHierarchyRadius: (level: 1 | 2 | 3): string => {
    return boxlogRadius.hierarchy[`level${level}` as keyof typeof boxlogRadius.hierarchy as keyof typeof hierarchy]
  },
  
  /**
   * サイズに応じた角丸を取得
   */
  getSizeRadius: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    return boxlogRadius.sizeRelation[size as keyof typeof sizeRelation]
  },
  
  /**
   * 機能に応じた角丸を取得
   */
  getFunctionalRadius: (purpose: keyof typeof boxlogRadius.functional): string => {
    return boxlogRadius.functional[purpose as keyof typeof functional]
  },
  
  /**
   * グループ内の位置に応じた角丸を取得
   */
  getGroupRadius: (position: 'first' | 'middle' | 'last' | 'single'): string => {
    return specialRadius.group[position as keyof typeof group]
  },
} as const

// ============================================
// 使用例とベストプラクティス
// ============================================

/**
 * 実装例
 * @example
 * ```tsx
 * import { componentRadius, radiusUtils } from '@/config/theme/rounded'
 * 
 * // 標準的なボタン
 * <button className={`${componentRadius.button.md} px-4 py-2 bg-blue-600`}>
 *   保存する
 * </button>
 * 
 * // カード（階層構造）
 * <div className={`${componentRadius.card.base} bg-white p-6`}>
 *   <div className={`${componentRadius.card.nested} bg-gray-50 p-4`}>
 *     入れ子コンテンツ
 *   </div>
 * </div>
 * 
 * // アバター
 * <img className={`${componentRadius.media.avatar} w-10 h-10`} />
 * 
 * // モーダル
 * <div className={componentRadius.modal.container}>
 *   <header className={componentRadius.modal.header}>
 *     タイトル
 *   </header>
 * </div>
 * 
 * // ピル型ボタン
 * <button className={componentRadius.button.pill}>
 *   ピル型
 * </button>
 * 
 * // ユーティリティ使用
 * <div className={radiusUtils.getComponentRadius('card', 'base')}>
 *   動的にカードの角丸を適用
 * </div>
 * 
 * // グループボタン
 * <div className="flex">
 *   <button className={`${radiusUtils.getGroupRadius('first')} px-4 py-2`}>
 *     最初
 *   </button>
 *   <button className={`${radiusUtils.getGroupRadius('middle')} px-4 py-2`}>
 *     中間
 *   </button>
 *   <button className={`${radiusUtils.getGroupRadius('last')} px-4 py-2`}>
 *     最後
 *   </button>
 * </div>
 * ```
 */

/**
 * BoxLogの統一ルール
 * @description 開発時に迷わないためのガイドライン
 */
export const BoxLogRadiusGuide = {
  // 基本方針
  standard: "8px (rounded-lg) をメインに使用 ✅",
  
  // 迷った時の判断基準
  decision: {
    "ボタン": "8px (md) - クリック可能で親しみやすく",
    "カード": "12px (lg) - 少し大きめで柔らかく",
    "モーダル": "16px (xl) - 大きい要素なので大きめに",
    "バッジ": "円形 (full) - 小さくて可愛らしく",
    "インプット": "8px (md) - 統一感重視",
    "アバター": "円形 (full) - 人物は円形",
  },
  
  // 統一ルール
  rules: [
    "すべて8の倍数または4px（8pxグリッド準拠）",
    "階層が深いほど角を小さく（外側12px → 内側8px → 最内側4px）",
    "要素が大きいほど角を大きく（ボタン8px < カード12px < モーダル16px）",
    "機能で統一（全ボタン8px、全カード12px）",
    "迷ったら8px（BoxLog標準）",
  ],
  
  // 避けるべきパターン
  avoid: [
    "同じ用途で異なる角丸を使う",
    "8pxグリッドに合わない値（5px、7px、10pxなど）",
    "過度に大きな角丸（UI要素に24px以上）",
    "意味なく角丸を変える",
  ],
} as const

// ============================================
// 境界線システム（theme.tsから統合）
// ============================================

/**
 * 境界線システム
 * @description ボーダーとシャドウの定義
 */
export const borders = {
  /**
   * 境界線
   * @description 要素の境界を表現
   */
  border: {
    none: 'border-0',
    default: 'border border-neutral-200 dark:border-neutral-700',
    strong: 'border-2 border-neutral-300 dark:border-neutral-600',
    focus: 'ring-2 ring-blue-500 ring-offset-2',
  },
  
  /**
   * 角丸（radiusとの統合）
   * @description 要素の角丸レベル
   */
  radius: {
    none: radius.none,
    small: radius.sm,
    default: radius.md,
    large: radius.lg,
    full: radius.full,
  },
  
  /**
   * 影
   * @description 要素の立体感を表現
   */
  shadow: {
    none: 'shadow-none',
    small: 'shadow-sm',
    default: 'shadow-md',
    large: 'shadow-lg',
    floating: 'shadow-xl',
  },
} as const

// ============================================
// エクスポート統合
// ============================================

export const rounded = {
  ...radius,
  component: componentRadius,
  special: specialRadius,
  boxlog: boxlogRadius,
  borders,
  utils: radiusUtils,
  guide: BoxLogRadiusGuide,
  impression: radiusImpression,
} as const

// ============================================
// フォーム要素スタイルシステム
// ============================================

/**
 * フォーム要素の統一スタイル
 * @description 8pxグリッド準拠のフォーム要素
 */
export const formStyles = {
  /**
   * 基本入力フィールド
   */
  input: {
    base: `${radius.md} border border-neutral-300 dark:border-neutral-600 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100`,
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
    disabled: 'disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  },
  
  /**
   * テキストエリア
   */
  textarea: {
    base: `${radius.md} border border-neutral-300 dark:border-neutral-600 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none`,
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
    disabled: 'disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
  },
  
  /**
   * セレクトボックス
   */
  select: {
    base: `${radius.md} border border-neutral-300 dark:border-neutral-600 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 cursor-pointer`,
    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
    disabled: 'disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50',
    arrow: 'appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-no-repeat bg-right-2 bg-[length:1.5rem] pr-10',
  },
  
  /**
   * チェックボックス
   */
  checkbox: {
    base: `${radius.sm} w-4 h-4 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 cursor-pointer`,
    checked: 'bg-blue-500 border-blue-500 text-white',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    disabled: 'disabled:cursor-not-allowed disabled:opacity-50',
  },
  
  /**
   * ラジオボタン
   */
  radio: {
    base: `${radius.full} w-4 h-4 border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 cursor-pointer`,
    checked: 'bg-blue-500 border-blue-500',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    disabled: 'disabled:cursor-not-allowed disabled:opacity-50',
  },
  
  /**
   * ラベル
   */
  label: {
    base: 'text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1',
    required: 'after:content-["*"] after:text-red-500 after:ml-1',
    disabled: 'text-neutral-500 dark:text-neutral-500',
  },
  
  /**
   * ヘルプテキスト
   */
  help: {
    base: 'text-xs text-neutral-500 dark:text-neutral-400 mt-1',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
  },
  
  /**
   * フィールドグループ
   */
  group: {
    base: 'space-y-1',
    inline: 'flex items-center space-x-3',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  },
} as const

/**
 * フォーム要素ユーティリティ
 */
export const formUtils = {
  /**
   * 入力フィールドの状態クラスを取得
   */
  getInputClasses: (
    state: 'default' | 'error' | 'success' | 'disabled' = 'default'
  ): string => {
    const base = `${formStyles.input.base} ${formStyles.input.focus}`
    
    switch (state) {
      case 'error':
        return `${base} ${formStyles.input.error}`
      case 'success':
        return `${base} ${formStyles.input.success}`
      case 'disabled':
        return `${base} ${formStyles.input.disabled}`
      default:
        return base
    }
  },
  
  /**
   * ラベルの状態クラスを取得
   */
  getLabelClasses: (
    required = false,
    disabled = false
  ): string => {
    let classes = formStyles.label.base
    
    if (required) classes += ` ${formStyles.label.required}`
    if (disabled) classes += ` ${formStyles.label.disabled}`
    
    return classes
  },
  
  /**
   * ヘルプテキストの状態クラスを取得
   */
  getHelpClasses: (
    type: 'default' | 'error' | 'success' = 'default'
  ): string => {
    const {base} = formStyles.help
    
    switch (type) {
      case 'error':
        return `${base} ${formStyles.help.error}`
      case 'success':
        return `${base} ${formStyles.help.success}`
      default:
        return base
    }
  },
} as const

// export default rounded