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