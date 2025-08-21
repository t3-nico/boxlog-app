/**
 * BoxLog スペーシングシステム
 * @description 8pxグリッド準拠・型安全なスペーシングシステム（データ定義のみ）
 */

// ============================================
// 8pxグリッド基本値
// ============================================

/**
 * 基本スペーシング値（8pxグリッド準拠）
 */
export const space = {
  0: 'p-0',           // 0px
  1: 'p-1',           // 4px  ⚠️ 例外的使用
  2: 'p-2',           // 8px  ✅ 最小単位
  3: 'p-3',           // 12px
  4: 'p-4',           // 16px ✅ 基本
  5: 'p-5',           // 20px
  6: 'p-6',           // 24px ✅ 標準
  8: 'p-8',           // 32px ✅ 大きめ
  10: 'p-10',         // 40px ✅ セクション
  12: 'p-12',         // 48px ✅ 大セクション
  16: 'p-16',         // 64px ✅ 最大
} as const

/**
 * よく使うスペーシングパターン
 */
export const patterns = {
  // カードレイアウト
  card: {
    wrapper: 'p-6 rounded-lg',           // 24px余白
    header: 'mb-4',                      // 下16px
    content: 'space-y-4',               // 要素間16px
    footer: 'mt-6 pt-4 border-t',       // 上24px + パディング16px
  },
  
  // フォームレイアウト
  form: {
    group: 'mb-6',                      // グループ間24px
    label: 'mb-2',                      // ラベル下8px
    input: 'mb-1',                      // インプット下4px
    helper: 'mt-1',                     // ヘルパー上4px
    error: 'mt-2',                      // エラー上8px
  },
  
  // リストレイアウト
  list: {
    container: 'space-y-2',             // アイテム間8px
    item: 'p-4',                        // アイテム内16px
    compact: 'space-y-1 [&>*]:p-2',    // コンパクト版
  },
  
  // グリッドレイアウト
  grid: {
    default: 'grid gap-4',              // 16pxギャップ
    cards: 'grid gap-6',                // 24pxギャップ
    tight: 'grid gap-2',                // 8pxギャップ
  },
} as const

// ============================================
// 8pxグリッド対応の早見表
// ============================================

/**
 * 8pxグリッド対応の早見表
 */
export const spacingGuide = {
  // 基本単位
  unit: '8px',
  
  // よく使う値
  common: {
    xs: '8px (space-2)',
    sm: '16px (space-4)',     // ✅ 最頻出
    md: '24px (space-6)',     // ✅ 標準
    lg: '32px (space-8)',     // ✅ 大きめ
    xl: '48px (space-12)',    // ✅ セクション間
  },
  
  // 使用パターン
  usage: {
    padding: {
      button: 'px-4 py-2',          // 16px × 8px
      card: 'p-6',                  // 24px
      page: 'px-4 py-8 lg:px-8',    // レスポンシブ
    },
    margin: {
      element: 'mb-4',              // 16px
      section: 'mb-12',             // 48px
    },
    gap: {
      tight: 'gap-2',               // 8px
      normal: 'gap-4',              // 16px
      loose: 'gap-6',               // 24px
    },
  },
} as const

// ============================================
// コンポーネント固有のスペーシング
// ============================================

/**
 * Stack（縦並び）コンポーネント用
 */
export const stackGap = {
  xs: 'space-y-2',   // 8px
  sm: 'space-y-4',   // 16px ✅
  md: 'space-y-6',   // 24px ✅
  lg: 'space-y-8',   // 32px ✅
  xl: 'space-y-12',  // 48px ✅
} as const

/**
 * Inline（横並び）コンポーネント用
 */
export const inlineGap = {
  xs: 'flex gap-2',   // 8px
  sm: 'flex gap-4',   // 16px ✅
  md: 'flex gap-6',   // 24px ✅
  lg: 'flex gap-8',   // 32px ✅
  xl: 'flex gap-12',  // 48px ✅
} as const

/**
 * Card（カード）コンポーネント用
 */
export const cardVariants = {
  compact: 'p-4',        // 16px
  default: 'p-6',        // 24px ✅
  comfortable: 'p-8',    // 32px
} as const

/**
 * Grid（グリッド）コンポーネント用
 */
export const gridGap = {
  tight: 'gap-2',      // 8px
  default: 'gap-4',    // 16px ✅
  loose: 'gap-6',      // 24px
} as const

export const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
} as const

/**
 * PageContainer（ページコンテナ）用
 */
export const pageContainerStyles = {
  mobile: 'px-4 py-8',        // 16px × 32px
  tablet: 'md:px-6 md:py-10', // 24px × 40px
  desktop: 'lg:px-8 lg:py-12', // 32px × 48px ✅
  responsive: 'px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12',
} as const

// ============================================
// 型定義
// ============================================

export type SpacingSize8px = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type CardVariant = 'compact' | 'default' | 'comfortable'
export type GridGap = 'tight' | 'default' | 'loose'
export type GridCols = 1 | 2 | 3 | 4 | 6 | 12

// ============================================
// ユーティリティ関数
// ============================================

/**
 * Stackのギャップクラスを取得
 */
export function getStackGap(gap: SpacingSize8px): string {
  return stackGap[gap]
}

/**
 * Inlineのギャップクラスを取得
 */
export function getInlineGap(gap: SpacingSize8px): string {
  return inlineGap[gap]
}

/**
 * カードバリアントのクラスを取得
 */
export function getCardVariant(variant: CardVariant): string {
  return cardVariants[variant]
}

/**
 * グリッドのギャップクラスを取得
 */
export function getGridGap(gap: GridGap): string {
  return gridGap[gap]
}

/**
 * グリッドのカラムクラスを取得
 */
export function getGridCols(cols: GridCols): string {
  return gridCols[cols]
}

/**
 * PageContainerのレスポンシブスタイルを取得
 */
export function getPageContainerStyles(): string {
  return pageContainerStyles.responsive
}

/**
 * 8pxグリッド値かどうかを判定
 */
export function is8pxGrid(value: number): boolean {
  return value % 8 === 0 || value === 4 // 4pxは例外的に許可
}

/**
 * px値から最適なTailwindクラスを推定
 */
export function pxToTailwindSpacing(px: number): string {
  const mapping: Record<number, string> = {
    0: 'p-0',
    4: 'p-1',   // ⚠️ 例外
    8: 'p-2',   // ✅ 8px基準
    12: 'p-3',
    16: 'p-4',  // ✅ 16px基準
    20: 'p-5',
    24: 'p-6',  // ✅ 24px基準
    32: 'p-8',  // ✅ 32px基準
    40: 'p-10', // ✅ 40px基準
    48: 'p-12', // ✅ 48px基準
    64: 'p-16', // ✅ 64px基準
  }
  
  return mapping[px] || `p-[${px}px]`
}

/**
 * スペーシングの種類判定
 */
export function getSpacingType(className: string): 'padding' | 'margin' | 'gap' | 'space' | 'unknown' {
  if (className.includes('p-') || className.includes('px-') || className.includes('py-')) {
    return 'padding'
  }
  if (className.includes('m-') || className.includes('mx-') || className.includes('my-')) {
    return 'margin'
  }
  if (className.includes('gap-')) {
    return 'gap'
  }
  if (className.includes('space-')) {
    return 'space'
  }
  return 'unknown'
}

// ============================================
// デバッグ用ユーティリティ
// ============================================

/**
 * 8pxグリッドの検証（開発用）
 */
export function validateSpacing(className: string): { valid: boolean; reason?: string } {
  const spacingValue = extractSpacingValue(className)
  
  if (spacingValue === null) {
    return { valid: false, reason: 'Invalid spacing class' }
  }
  
  if (!is8pxGrid(spacingValue)) {
    return { valid: false, reason: `${spacingValue}px is not 8px grid compliant` }
  }
  
  return { valid: true }
}

/**
 * クラス名からpx値を抽出（開発用）
 */
function extractSpacingValue(className: string): number | null {
  const match = className.match(/-(\d+)/)
  if (!match) return null
  
  const tailwindValue = parseInt(match[1])
  
  // Tailwindの値 × 4 = px値
  return tailwindValue * 4
}

/**
 * 利用可能なスペーシングオプションを表示（開発用）
 */
export function getAvailableSpacingOptions() {
  if (process.env.NODE_ENV === 'production') return {}
  
  return {
    space: Object.keys(space),
    stackGap: Object.keys(stackGap),
    inlineGap: Object.keys(inlineGap),
    cardVariants: Object.keys(cardVariants),
    gridGap: Object.keys(gridGap),
    gridCols: Object.keys(gridCols),
    patterns: Object.keys(patterns),
  }
}