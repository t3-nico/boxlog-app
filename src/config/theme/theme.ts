/**
 * BoxLog デザインシステム
 * @description アプリ全体で使用するスタイル定義と使用ガイド
 */

// カラーシステムをインポート
import { colors } from './colors'

// ============================================
// タイポグラフィ
// ============================================

/**
 * タイポグラフィシステム
 * @description 文字サイズと使用場面の定義
 */
export const typography = {
  /**
   * ページタイトル（h1）
   * @description ページの最上位タイトル
   * @example ダッシュボード、設定、カレンダー
   * @usage 1ページに1つだけ
   */
  h1: 'text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50',
  
  /**
   * セクションタイトル（h2）
   * @description 大きなセクションの見出し
   * @example 「今日のタスク」「完了済み」
   * @usage セクションごとに1つ
   */
  h2: 'text-3xl font-semibold text-neutral-800 dark:text-neutral-100',
  
  /**
   * サブセクションタイトル（h3）
   * @description セクション内の小見出し
   * @example カード内のタイトル、モーダルタイトル
   * @usage 必要に応じて複数可
   */
  h3: 'text-2xl font-medium text-neutral-800 dark:text-neutral-100',
  
  /**
   * 小見出し（h4）
   * @description リスト項目のタイトルなど
   * @example タスクカードのタイトル
   */
  h4: 'text-xl font-medium text-neutral-700 dark:text-neutral-200',
  
  /**
   * ラベル見出し（h5）
   * @description フォームセクションのラベル
   * @example 「基本情報」「詳細設定」
   */
  h5: 'text-lg font-medium text-neutral-700 dark:text-neutral-200',
  
  /**
   * 最小見出し（h6）
   * @description 補助的な見出し
   * @example ヘルプテキストのタイトル
   */
  h6: 'text-base font-medium text-neutral-600 dark:text-neutral-300',
  
  /**
   * 本文（body）
   * @description 通常のテキスト
   * @example 説明文、本文
   */
  body: 'text-base text-neutral-700 dark:text-neutral-300 leading-relaxed',
  
  /**
   * 本文（大）
   * @description 重要な本文
   * @example リード文、重要な説明
   */
  bodyLarge: 'text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed',
  
  /**
   * 本文（小）
   * @description 補助的なテキスト
   * @example 注釈、ヘルプテキスト
   */
  bodySmall: 'text-sm text-neutral-600 dark:text-neutral-400',
  
  /**
   * キャプション
   * @description 最小のテキスト
   * @example 日付、著者名、補足情報
   */
  caption: 'text-xs text-neutral-500 dark:text-neutral-500',
  
  /**
   * ラベル
   * @description フォームラベル
   * @example 入力欄のラベル
   */
  label: 'text-sm font-medium text-neutral-700 dark:text-neutral-300',
  
  /**
   * エラーテキスト
   * @description エラーメッセージ
   * @example バリデーションエラー
   */
  error: 'text-sm text-red-600 dark:text-red-400',
} as const

// ============================================
// スペーシング
// ============================================

/**
 * スペーシングシステム
 * @description 余白の定義と使用場面
 */
export const spacing = {
  /**
   * ページ余白
   * @description ページ全体のパディング
   * @usage layoutコンポーネントのルート
   */
  page: {
    mobile: 'px-4 py-6',
    tablet: 'px-6 py-8',
    desktop: 'px-8 py-10',
    default: 'px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10',
  },
  
  /**
   * セクション間隔
   * @description 大きなセクション間の余白
   * @usage h2セクション間
   */
  section: {
    small: 'mb-6',
    medium: 'mb-8',
    large: 'mb-12',
    default: 'mb-8 md:mb-12',
  },
  
  /**
   * コンテンツ間隔
   * @description コンテンツブロック間の余白
   * @usage カード間、段落間
   */
  content: {
    small: 'space-y-2',
    medium: 'space-y-4',
    large: 'space-y-6',
    default: 'space-y-4',
  },
  
  /**
   * カード内余白
   * @description カードコンポーネントの内側余白
   * @usage Card, Modal, Dialog
   */
  card: {
    compact: 'p-3',
    default: 'p-4 md:p-6',
    comfortable: 'p-6 md:p-8',
  },
  
  /**
   * インライン間隔
   * @description 横並び要素の間隔
   * @usage ボタングループ、タグリスト
   */
  inline: {
    small: 'space-x-1',
    medium: 'space-x-2',
    large: 'space-x-4',
    default: 'space-x-2',
  },
} as const

// ============================================
// レイアウト
// ============================================

/**
 * レイアウトシステム
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
// カラーパレット（外部ファイルから）
// ============================================

// カラーシステムは colors.ts で詳細定義
export { colors }

// ============================================
// 境界線とシャドウ
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
   * 角丸
   * @description 要素の角丸レベル
   */
  radius: {
    none: 'rounded-none',
    small: 'rounded-sm',
    default: 'rounded-md',
    large: 'rounded-lg',
    full: 'rounded-full',
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
// アニメーション
// ============================================

/**
 * アニメーションシステム
 * @description トランジションとアニメーション
 */
export const animations = {
  /**
   * トランジション
   * @description 状態変化のアニメーション
   */
  transition: {
    fast: 'transition-all duration-150 ease-out',
    default: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
  },
  
  /**
   * ホバー効果
   * @description インタラクティブ要素のホバー
   */
  hover: {
    lift: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    opacity: 'hover:opacity-80 transition-opacity duration-200',
  },
  
  /**
   * フェード
   * @description 表示・非表示アニメーション
   */
  fade: {
    in: 'animate-in fade-in duration-200',
    out: 'animate-out fade-out duration-200',
  },
} as const

// ============================================
// 使用例とベストプラクティス
// ============================================

/**
 * 使用例とベストプラクティス
 * 
 * @example
 * ```tsx
 * // ページ構造の例
 * <main className={spacing.page.default}>
 *   <h1 className={typography.h1}>ダッシュボード</h1>
 *   
 *   <section className={spacing.section.default}>
 *     <h2 className={typography.h2}>今日のタスク</h2>
 *     <div className={spacing.content.default}>
 *       {tasks.map(task => (
 *         <Card className={`${spacing.card.default} ${borders.border.default} ${borders.radius.default}`}>
 *           <h3 className={typography.h3}>{task.title}</h3>
 *           <p className={typography.body}>{task.description}</p>
 *         </Card>
 *       ))}
 *     </div>
 *   </section>
 * </main>
 * ```
 */
export const examples = {
  pageStructure: `
    <h1> → ページに1つ
    　<h2> → セクションタイトル
    　　<h3> → カードタイトル
    　　　<body> → 説明文
    　　　<caption> → 補足
  `,
  
  spacingRules: `
    ページ → page padding
    　セクション → section margin
    　　コンテンツ → content spacing
    　　　カード → card padding
  `,
  
  colorUsage: `
    ブランド → 主要アクション、ナビゲーション
    成功 → 完了、成功メッセージ
    警告 → 注意喚起、変更前の確認
    エラー → エラーメッセージ、削除アクション
    情報 → ヒント、追加情報
  `,
}