/**
 * BoxLog タイポグラフィシステム
 * シンプル・実用的・迷わない（データ定義のみ）
 */

// ============================================
// 見出し（6段階）
// ============================================

export const heading = {
  /**
   * h1: ページタイトル
   * @usage 1ページに1つだけ
   * @example "ダッシュボード" "設定" "カレンダー"
   */
  h1: 'text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50',
  
  /**
   * h2: セクションタイトル
   * @usage 大きな区切り
   * @example "今日のタスク" "今週の予定" "完了済み"
   */
  h2: 'text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50',
  
  /**
   * h3: サブセクション
   * @usage セクション内の区切り
   * @example "午前のタスク" "重要" "その他"
   */
  h3: 'text-xl md:text-2xl font-medium text-neutral-800 dark:text-neutral-100',
  
  /**
   * h4: カードタイトル
   * @usage カード・モーダルの見出し
   * @example タスクカードのタイトル
   */
  h4: 'text-lg font-medium text-neutral-800 dark:text-neutral-100',
  
  /**
   * h5: グループラベル
   * @usage 項目グループの見出し
   * @example "基本設定" "通知設定" "プライバシー"
   */
  h5: 'text-base font-medium text-neutral-700 dark:text-neutral-200',
  
  /**
   * h6: 最小見出し
   * @usage 補助的な見出し
   * @example ヘルプテキストの見出し
   */
  h6: 'text-sm font-medium text-neutral-600 dark:text-neutral-300',
}

// ============================================
// 本文（3サイズ）
// ============================================

export const body = {
  /**
   * 大きい本文
   * @usage 重要な説明・リード文
   * @example ページの説明文、空状態のメッセージ
   */
  large: 'text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed',
  
  /**
   * 通常の本文（デフォルト）
   * @usage 一般的なテキスト
   * @example 説明文、本文、リスト項目
   */
  DEFAULT: 'text-base text-neutral-700 dark:text-neutral-300 leading-normal',
  
  /**
   * 小さい本文
   * @usage 補足・注釈
   * @example 更新日時、補足説明、ヘルプテキスト
   */
  small: 'text-sm text-neutral-600 dark:text-neutral-400 leading-normal',
}

// ============================================
// 特殊用途（最小限）
// ============================================

export const special = {
  /**
   * ラベル
   * @usage フォームのラベル、項目名
   * @example "メールアドレス" "パスワード"
   */
  label: 'text-sm font-medium text-neutral-700 dark:text-neutral-300',
  
  /**
   * エラーメッセージ
   * @usage バリデーションエラー
   * @example "必須項目です" "形式が正しくありません"
   */
  error: 'text-sm text-red-600 dark:text-red-400',
  
  /**
   * キャプション
   * @usage 最小のテキスト
   * @example "3分前" "© 2024 BoxLog"
   */
  caption: 'text-xs text-neutral-500 dark:text-neutral-500',
  
  /**
   * コード
   * @usage コード・技術的な表記
   * @example "npm install" "Ctrl+S"
   */
  code: 'text-sm font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded',
}

// ============================================
// リンクスタイル
// ============================================

export const link = {
  /**
   * デフォルトリンク
   * @usage 通常のテキストリンク
   * @example 記事内リンク、詳細へのリンク
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
   * @usage メニュー項目
   * @example ヘッダーナビ、サイドバー
   */
  nav: 'text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
  
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
  buttonLink: 'inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors',
  
  /**
   * パンくずリンク
   * @usage ナビゲーション階層
   */
  breadcrumb: 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
  
  /**
   * タブリンク
   * @usage タブ切り替え
   */
  tab: 'pb-2 border-b-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600',
  tabActive: 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400',
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
}

// ============================================
// 型定義
// ============================================

type HeadingVariant = keyof typeof heading
type BodyVariant = keyof typeof body
type SpecialVariant = keyof typeof special

export type TypographyVariant = 
  | `heading.${HeadingVariant}`
  | `body.${BodyVariant}`
  | `special.${SpecialVariant}`

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
    default:
      return false
  }
}

/**
 * HTMLタグ推定関数
 */
export function getDefaultTag(variant: TypographyVariant): keyof JSX.IntrinsicElements {
  const tagMap: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
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
  }
  
  return tagMap[variant] || 'p'
}

// ============================================
// 使用例のエクスポート
// ============================================

/**
 * 使用例
 * @example
 * ```tsx
 * // ページ構造
 * <PageTitle>ダッシュボード</PageTitle>
 * <BodyLarge>今日の予定を確認しましょう</BodyLarge>
 * 
 * <SectionTitle>進行中のタスク</SectionTitle>
 * 
 * <div className="card">
 *   <CardTitle>レポート作成</CardTitle>
 *   <Body>月次レポートの作成と提出</Body>
 *   <Caption>期限: 3日後</Caption>
 * </div>
 * 
 * // フォーム
 * <Label>タスク名</Label>
 * <input />
 * <ErrorText>必須項目です</ErrorText>
 * 
 * // パターン使用
 * <h1 className={patterns.pageHeader.title}>タイトル</h1>
 * <p className={patterns.pageHeader.description}>説明</p>
 * 
 * // リンク使用例
 * <a className={link.default}>詳細を見る</a>
 * 
 * <nav>
 *   <a className={link.nav}>ホーム</a>
 *   <a className={`${link.nav} ${linkStates.active}`}>タスク</a>
 *   <a className={link.nav}>カレンダー</a>
 * </nav>
 * 
 * <a className={link.external} target="_blank">ドキュメント</a>
 * 
 * <p className={body.DEFAULT}>
 *   詳しくは<a className={link.inline}>こちら</a>をご覧ください。
 * </p>
 * 
 * <a className={link.danger}>このタスクを削除</a>
 * ```
 */

export {
  heading,
  body,
  special,
  link,
  linkStates,
  linkPatterns,
  patterns,
  type TypographyVariant,
}