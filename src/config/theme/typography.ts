/**
 * BoxLog タイポグラフィシステム
 * シンプル・実用的・迷わない（14px基準版）
 */

// ============================================
// 見出し（6段階）- 14px基準で再構成
// ============================================

export const heading = {
  /**
   * h1: ページタイトル
   * @usage 1ページに1つだけ
   * @example "ダッシュボード" "設定" "カレンダー"
   * @size 24px → 28px (モバイル → デスクトップ)
   */
  h1: 'text-2xl md:text-[28px] font-medium tracking-tight text-neutral-900 dark:text-neutral-50',
  
  /**
   * h2: セクションタイトル
   * @usage 大きな区切り
   * @example "今日のタスク" "今週の予定" "完了済み"
   * @size 20px → 24px
   */
  h2: 'text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50',
  
  /**
   * h3: サブセクション
   * @usage セクション内の区切り
   * @example "午前のタスク" "重要" "その他"
   * @size 18px → 20px
   */
  h3: 'text-lg md:text-xl font-medium text-neutral-800 dark:text-neutral-100',
  
  /**
   * h4: カードタイトル
   * @usage カード・モーダルの見出し
   * @example タスクカードのタイトル
   * @size 16px
   */
  h4: 'text-base font-medium text-neutral-800 dark:text-neutral-100',
  
  /**
   * h5: グループラベル / サイドバー見出し
   * @usage 項目グループの見出し、サイドバーセクション
   * @example "基本設定" "通知設定" "プライバシー"
   * @size 14px (基準サイズ)
   */
  h5: 'text-sm font-medium text-neutral-700 dark:text-neutral-200',
  
  /**
   * h6: 最小見出し
   * @usage 補助的な見出し
   * @example ヘルプテキストの見出し
   * @size 12px
   */
  h6: 'text-xs font-medium text-neutral-600 dark:text-neutral-300',
}

// ============================================
// 本文（3サイズ）- 14px中心
// ============================================

export const body = {
  /**
   * 大きい本文
   * @usage 重要な説明・リード文
   * @example ページの説明文、空状態のメッセージ
   * @size 16px
   */
  large: 'text-base text-neutral-700 dark:text-neutral-300 leading-relaxed',
  
  /**
   * 通常の本文（デフォルト）★基準サイズ
   * @usage 一般的なテキスト
   * @example 説明文、本文、リスト項目
   * @size 14px
   */
  DEFAULT: 'text-sm text-neutral-700 dark:text-neutral-300 leading-tight',
  
  /**
   * 太字バリエーション
   * @usage 重要なテキスト、強調表示
   * @size 14px
   */
  semibold: 'text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-tight',
  
  /**
   * 小さい本文
   * @usage 補足・注釈
   * @example 更新日時、補足説明、ヘルプテキスト
   * @size 12px
   */
  small: 'text-xs text-neutral-600 dark:text-neutral-400 leading-tight',
  
  /**
   * さらに小さい本文（smエイリアス）
   * @usage small と同じ
   * @size 12px
   */
  sm: 'text-xs text-neutral-600 dark:text-neutral-400 leading-tight',
}

// ============================================
// 特殊用途（最小限）
// ============================================

export const special = {
  /**
   * ラベル
   * @usage フォームのラベル、項目名
   * @example "メールアドレス" "パスワード"
   * @size 14px (基準サイズ)
   */
  label: 'text-sm font-medium text-neutral-700 dark:text-neutral-300',
  
  /**
   * エラーメッセージ
   * @usage バリデーションエラー
   * @example "必須項目です" "形式が正しくありません"
   * @size 13px
   */
  error: 'text-xs text-red-600 dark:text-red-400',
  
  /**
   * キャプション
   * @usage 最小のテキスト
   * @example "3分前" "© 2024 BoxLog"
   * @size 12px
   */
  caption: 'text-xs text-neutral-500 dark:text-neutral-500',
  
  /**
   * コード
   * @usage コード・技術的な表記
   * @example "npm install" "Ctrl+S"
   * @size 12px
   */
  code: 'text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded',
}

// ============================================
// サイドバー専用スタイル（14px基準）
// ============================================

export const sidebar = {
  /**
   * サイドバーセクションタイトル
   * @usage サイドバー内の大見出し
   * @size 14px (基準サイズ、太字で差別化)
   */
  sectionTitle: 'text-sm font-semibold text-neutral-800 dark:text-neutral-100 uppercase tracking-wide',
  
  /**
   * サイドバーグループタイトル
   * @usage サイドバー内の小見出し
   * @size 12px
   */
  groupTitle: 'text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider',
  
  /**
   * サイドバーアイテム
   * @usage サイドバーのリンク項目
   * @size 14px (基準サイズ)
   */
  item: 'text-sm text-neutral-700 dark:text-neutral-300',
  
  /**
   * サイドバーサブアイテム
   * @usage サイドバーの子項目
   * @size 12px
   */
  subItem: 'text-xs text-neutral-600 dark:text-neutral-400 pl-4',
  
  /**
   * サイドバーバッジ
   * @usage カウント表示など
   * @size 12px
   */
  badge: 'text-xs font-medium text-neutral-500 dark:text-neutral-500',
}

// ============================================
// リンクスタイル（14px基準）
// ============================================

export const link = {
  /**
   * デフォルトリンク
   * @usage 通常のテキストリンク
   * @example 記事内リンク、詳細へのリンク
   * @size 継承（14px想定）
   */
  default: 'text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300',
  
  /**
   * 下線なしリンク
   * @usage ナビゲーション、メニュー
   * @example サイドバーのリンク
   */
  plain: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
  
  /**
   * ホバーで下線
   * @usage 控えめなリンク
   * @example カードタイトル、リスト項目
   */
  hover: 'text-blue-600 dark:text-blue-400 hover:underline underline-offset-2',
  
  /**
   * インラインリンク
   * @usage 文章中のリンク
   * @example 本文内のリンク
   */
  inline: 'text-blue-600 dark:text-blue-400 underline underline-offset-1 decoration-blue-300 hover:decoration-blue-600',
  
  /**
   * ナビゲーションリンク
   * @usage メニュー項目（14px基準）
   * @example ヘッダーナビ、サイドバー
   */
  nav: 'text-sm text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
  
  /**
   * 破壊的リンク
   * @usage 削除、危険な操作
   * @example "アカウント削除"
   */
  danger: 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300',
  
  /**
   * 無効リンク
   * @usage クリック不可
   * @example 権限なし、未実装
   */
  disabled: 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed no-underline',
  
  /**
   * 外部リンク
   * @usage 外部サイトへ
   * @example 外部ドキュメント
   */
  external: 'text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 after:content-["↗"] after:ml-0.5 after:text-xs',
}

// ============================================
// リンク状態
// ============================================

export const linkStates = {
  /**
   * 訪問済み
   * @note 必要に応じて使用
   */
  visited: 'visited:text-purple-600 dark:visited:text-purple-400',
  
  /**
   * フォーカス
   * @note アクセシビリティ
   */
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  /**
   * アクティブ（現在のページ）
   * @usage ナビゲーション
   */
  active: 'text-blue-600 dark:text-blue-400 font-medium',
}

// ============================================
// 複合パターン
// ============================================

export const linkPatterns = {
  /**
   * ボタンっぽいリンク
   * @usage CTA的なリンク
   */
  buttonLink: 'inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors',
  
  /**
   * パンくずリンク
   * @usage ナビゲーション階層
   */
  breadcrumb: 'text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
  
  /**
   * タブリンク
   * @usage タブ切り替え
   */
  tab: 'text-sm pb-2 border-b-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600',
  tabActive: 'text-sm border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400',
}

// ============================================
// 実用的な組み合わせ
// ============================================

/**
 * よく使う組み合わせパターン
 */
export const patterns = {
  /**
   * ページヘッダー
   * @example ページ上部のタイトルと説明
   */
  pageHeader: {
    title: heading.h1,
    description: body.large,
  },
  
  /**
   * カード
   * @example タスクカード、設定カード
   */
  card: {
    title: heading.h4,
    content: body.DEFAULT,
    meta: special.caption,
  },
  
  /**
   * フォーム
   * @example 入力フォーム
   */
  form: {
    label: special.label,
    helper: body.small,
    error: special.error,
  },
  
  /**
   * 空状態
   * @example データがない時の表示
   */
  empty: {
    title: heading.h3,
    message: body.large,
  },
  
  /**
   * サイドバー
   * @example サイドバー内の要素
   */
  sidebar: {
    section: sidebar.sectionTitle,
    group: sidebar.groupTitle,
    item: sidebar.item,
    subItem: sidebar.subItem,
    badge: sidebar.badge,
  },
  
  /**
   * テーブル
   * @example データテーブル
   */
  table: {
    header: 'text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider',
    cell: 'text-sm text-neutral-900 dark:text-neutral-100',
  },
}

// ============================================
// サイズ階層（14px基準）
// ============================================

/**
 * フォントサイズ階層
 * 
 * 大見出し:
 * - 28px: h1 (デスクトップ)
 * - 24px: h1 (モバイル), h2 (デスクトップ)
 * - 20px: h2 (モバイル), h3 (デスクトップ)
 * - 18px: h3 (モバイル)
 * 
 * 中見出し:
 * - 16px: h4
 * - 14px: h5, 本文標準 ★基準サイズ
 * - 13px: h6, 小さい本文
 * 
 * 小テキスト:
 * - 12px: キャプション
 * - 11px: バッジ（最小）
 * 
 * Tailwind対応:
 * - text-xs: 12px
 * - text-sm: 14px ★基準
 * - text-base: 16px
 * - text-lg: 18px
 * - text-xl: 20px
 * - text-2xl: 24px
 * - text-Npx: カスタムサイズ
 */

// ============================================
// 型定義
// ============================================

type HeadingVariant = keyof typeof heading
type BodyVariant = keyof typeof body
type SpecialVariant = keyof typeof special
type SidebarVariant = keyof typeof sidebar

export type TypographyVariant = 
  | `heading.${HeadingVariant}`
  | `body.${BodyVariant}`
  | `special.${SpecialVariant}`
  | `sidebar.${SidebarVariant}`

// ============================================
// ユーティリティ関数
// ============================================

/**
 * スタイル取得関数
 */
export function getTypographyStyle(variant: TypographyVariant): string {
  const [category, type] = variant.split('.') as [string, string]
  
  switch (category) {
    case 'heading':
      return heading[type as HeadingVariant]
    case 'body':
      return body[type as BodyVariant]
    case 'special':
      return special[type as SpecialVariant]
    case 'sidebar':
      return sidebar[type as SidebarVariant]
    default:
      return body.DEFAULT
  }
}

/**
 * バリアント判定関数
 */
export function isTypographyVariant(value: string): value is TypographyVariant {
  if (!value.includes('.')) return false
  
  const [category, type] = value.split('.')
  
  switch (category) {
    case 'heading':
      return type in heading
    case 'body':
      return type in body
    case 'special':
      return type in special
    case 'sidebar':
      return type in sidebar
    default:
      return false
  }
}

/**
 * HTMLタグ推定関数
 */
export function getDefaultTag(variant: TypographyVariant): keyof JSX.IntrinsicElements {
  const tagMap: Record<string, keyof JSX.IntrinsicElements> = {
    'heading.h1': 'h1',
    'heading.h2': 'h2',
    'heading.h3': 'h3',
    'heading.h4': 'h4',
    'heading.h5': 'h5',
    'heading.h6': 'h6',
    'body.large': 'p',
    'body.DEFAULT': 'p',
    'body.small': 'p',
    'special.label': 'label',
    'special.error': 'span',
    'special.caption': 'span',
    'special.code': 'code',
    'sidebar.sectionTitle': 'h3',
    'sidebar.groupTitle': 'h4',
    'sidebar.item': 'span',
    'sidebar.subItem': 'span',
    'sidebar.badge': 'span',
  }
  
  return variant in tagMap ? tagMap[variant] : 'p'
}

// ============================================
// 使用例のエクスポート
// ============================================

/**
 * 使用例
 * @example
 * ```tsx
 * // 基本的な使用（14px基準）
 * <h1 className={heading.h1}>ダッシュボード</h1>
 * <p className={body.DEFAULT}>標準の本文テキスト（14px）</p>
 * 
 * // サイドバー（14px基準）
 * <aside>
 *   <h3 className={sidebar.sectionTitle}>メニュー</h3>
 *   <nav>
 *     <a className={`${sidebar.item} ${link.nav}`}>ダッシュボード</a>
 *     <a className={`${sidebar.item} ${link.nav}`}>
 *       タスク
 *       <span className={sidebar.badge}>12</span>
 *     </a>
 *     <h4 className={sidebar.groupTitle}>設定</h4>
 *     <a className={`${sidebar.subItem} ${link.nav}`}>プロフィール</a>
 *     <a className={`${sidebar.subItem} ${link.nav}`}>通知</a>
 *   </nav>
 * </aside>
 * 
 * // カード
 * <div className="card">
 *   <h4 className={heading.h4}>カードタイトル（16px）</h4>
 *   <p className={body.DEFAULT}>カード内容（14px）</p>
 *   <span className={special.caption}>3分前（12px）</span>
 * </div>
 * 
 * // フォーム（14px基準）
 * <label className={special.label}>メールアドレス（14px）</label>
 * <input className="text-sm" /> // 入力も14px
 * <span className={special.error}>形式が正しくありません（13px）</span>
 * 
 * // パターン使用
 * <h1 className={patterns.pageHeader.title}>タイトル</h1>
 * <p className={patterns.pageHeader.description}>説明</p>
 * 
 * // テーブル
 * <table>
 *   <thead>
 *     <tr>
 *       <th className={patterns.table.header}>名前</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td className={patterns.table.cell}>田中太郎</td>
 *     </tr>
 *   </tbody>
 * </table>
 * ```
 */

// ============================================
// 統合オブジェクト
// ============================================

export const typography = {
  heading,
  body,
  special,
  sidebar,
  link,
  linkStates,
  linkPatterns,
  patterns,
} as const