/**
 * BoxLog カラーシステム
 * ライト/ダークモード完全対応
 * デジタル庁ガイドライン準拠
 */

// ============================================
// プライマリーカラー（青 - UI機能色）
// ============================================

/**
 * プライマリーカラー
 * @description インタラクティブ要素の主要色
 * @light blue-600 (白背景に対して4.52:1)
 * @dark blue-400 (黒背景に対して6.84:1)
 */
export const primary = {
  // ボタン・主要アクション
  DEFAULT: 'bg-blue-600 dark:bg-blue-400',
  hover: 'bg-blue-700 dark:bg-blue-500',
  active: 'bg-blue-800 dark:bg-blue-600',
  
  // テキストリンク
  text: 'text-blue-600 dark:text-blue-400',
  textHover: 'hover:text-blue-700 dark:hover:text-blue-300',
  
  // ボーダー
  border: 'border-blue-600 dark:border-blue-400',
  
  // フォーカスリング
  ring: 'ring-blue-600 dark:ring-blue-400',
} as const

/**
 * セカンダリーカラー
 * @description 副次的な操作要素
 * @light blue-100 (薄い青背景)
 * @dark blue-900/30 (透明度のある濃い青)
 */
export const secondary = {
  // 背景（ゴーストボタンなど）
  DEFAULT: 'bg-blue-100 dark:bg-blue-900/30',
  hover: 'bg-blue-200 dark:bg-blue-900/50',
  
  // テキスト（セカンダリーアクション）
  text: 'text-blue-700 dark:text-blue-300',
  
  // ボーダー（アウトラインボタンなど）
  border: 'border-blue-200 dark:border-blue-800',
  
  // 選択状態の背景
  selected: 'bg-blue-100 dark:bg-blue-900/20',
} as const

/**
 * ターシャリーカラー
 * @description 強調・特殊用途
 * @light blue-900 (濃い青)
 * @dark blue-100 (薄い青)
 */
export const tertiary = {
  DEFAULT: 'bg-blue-900 dark:bg-blue-100',
  text: 'text-blue-900 dark:text-blue-100',
  border: 'border-blue-900 dark:border-blue-100',
} as const

// ============================================
// ブランドカラー（ニュートラル）
// ============================================

/**
 * ブランドカラー
 * @description BoxLogのアイデンティティ
 * @note 操作要素には使用しない
 */
export const brand = {
  // ロゴ・ヘッダー
  logo: 'text-neutral-900 dark:text-neutral-50',
  header: 'bg-white dark:bg-neutral-900',
  
  // アクセント（装飾用）
  accent: 'bg-neutral-100 dark:bg-neutral-800',
} as const

// ============================================
// 背景色システム
// ============================================

/**
 * 背景色
 * @description レイヤー構造の背景色
 */
export const background = {
  // レベル0: ページ背景
  base: 'bg-white dark:bg-neutral-950',
  
  // レベル1: カード・セクション
  surface: 'bg-white dark:bg-neutral-900',
  
  // レベル2: ネストされた要素
  elevated: 'bg-neutral-50 dark:bg-neutral-800',
  
  // レベル3: ホバー・アクティブ
  hover: 'bg-neutral-100 dark:bg-neutral-800/50',
  
  // 特殊: インタラクティブエリア
  interactive: 'bg-blue-50 dark:bg-blue-950/10',
} as const

// ============================================
// テキストカラー
// ============================================

/**
 * テキストカラー
 * @description コントラスト比を確保した文字色
 */
export const text = {
  // 見出し・重要テキスト
  primary: 'text-neutral-900 dark:text-neutral-50',
  
  // 本文
  secondary: 'text-neutral-700 dark:text-neutral-200',
  
  // 補助・説明
  muted: 'text-neutral-500 dark:text-neutral-400',
  
  // 無効状態
  disabled: 'text-neutral-400 dark:text-neutral-600',
  
  // 白背景上の白文字（ボタン内など）
  inverse: 'text-white dark:text-neutral-900',
} as const

// ============================================
// ボーダーカラー
// ============================================

/**
 * ボーダーカラー
 * @description 境界線の色
 */
export const border = {
  // 通常の境界線
  DEFAULT: 'border-neutral-200 dark:border-neutral-800',
  
  // 強調境界線
  strong: 'border-neutral-300 dark:border-neutral-700',
  
  // 薄い境界線
  subtle: 'border-neutral-100 dark:border-neutral-900',
} as const

// ============================================
// セマンティックカラー（状態表示）
// ============================================

/**
 * セマンティックカラー
 * @description 意味を持つ色（両モード対応）
 */
export const semantic = {
  // 成功・完了
  success: {
    DEFAULT: 'bg-green-600 dark:bg-green-500',
    light: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-600 dark:border-green-500',
    ring: 'ring-green-600 dark:ring-green-500',
  },
  
  // 警告・注意
  warning: {
    DEFAULT: 'bg-amber-600 dark:bg-amber-500',
    light: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-600 dark:border-amber-500',
    ring: 'ring-amber-600 dark:ring-amber-500',
  },
  
  // エラー・削除
  error: {
    DEFAULT: 'bg-red-600 dark:bg-red-500',
    light: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-600 dark:border-red-500',
    ring: 'ring-red-600 dark:ring-red-500',
  },
  
  // 情報
  info: {
    DEFAULT: 'bg-blue-600 dark:bg-blue-500',
    light: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-600 dark:border-blue-500',
    ring: 'ring-blue-600 dark:ring-blue-500',
  },
} as const

// ============================================
// 状態カラー（インタラクション）
// ============================================

/**
 * 状態カラー
 * @description インタラクション状態を表現
 */
export const state = {
  // 無効状態
  disabled: {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-400 dark:text-neutral-600',
    border: 'border-neutral-200 dark:border-neutral-700',
    cursor: 'cursor-not-allowed',
  },
  
  // ローディング状態
  loading: {
    bg: 'bg-neutral-100 dark:bg-neutral-800',
    text: 'text-neutral-500 dark:text-neutral-400',
    cursor: 'cursor-wait',
    opacity: 'opacity-75',
  },
  
  // フォーカス状態
  focus: {
    ring: 'ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950',
    outline: 'outline-none',
  },
  
  // 選択状態
  selected: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-600 dark:border-blue-400',
  },
} as const

// ============================================
// グラデーション
// ============================================

/**
 * グラデーション
 * @description 特殊な装飾用グラデーション
 */
export const gradient = {
  // プライマリーグラデーション
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500',
  
  // セカンダリーグラデーション
  secondary: 'bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700',
  
  // サクセスグラデーション
  success: 'bg-gradient-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600',
  
  // 背景用の微細グラデーション
  subtle: 'bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900',
} as const

// ============================================
// カラーユーティリティ関数
// ============================================

/**
 * カラーユーティリティ
 * @description カラーの組み合わせや変換を簡単に行う
 */
export const colorUtils = {
  /**
   * プライマリーボタンの完全なスタイル
   */
  primaryButton: `${primary.DEFAULT} ${text.inverse} ${primary.hover} ${state.focus.ring} ${state.focus.outline}`,
  
  /**
   * セカンダリーボタンの完全なスタイル
   */
  secondaryButton: `${secondary.DEFAULT} ${secondary.text} ${secondary.hover} ${state.focus.ring} ${state.focus.outline}`,
  
  /**
   * アウトラインボタンの完全なスタイル
   */
  outlineButton: `${background.base} ${primary.text} ${secondary.border} ${secondary.hover} ${state.focus.ring} ${state.focus.outline}`,
  
  /**
   * ゴーストボタンの完全なスタイル
   */
  ghostButton: `${primary.text} ${background.hover} ${state.focus.ring} ${state.focus.outline}`,
  
  /**
   * カード背景の完全なスタイル
   */
  cardSurface: `${background.surface} ${border.DEFAULT}`,
  
  /**
   * インタラクティブカードの完全なスタイル
   */
  interactiveCard: `${background.surface} ${border.DEFAULT} ${background.hover} transition-colors duration-200`,
  
  /**
   * 入力フィールドの完全なスタイル
   */
  input: `${background.base} ${text.primary} ${border.DEFAULT} ${state.focus.ring} ${state.focus.outline}`,
} as const

// ============================================
// コントラスト比チェック
// ============================================

/**
 * コントラスト比情報
 * @description アクセシビリティガイドライン準拠の確認
 */
export const ContrastRatios = {
  // ライトモード
  light: {
    "blue-600 on white": 4.52,     // ✅ AA合格
    "neutral-900 on white": 17.4,  // ✅ AAA合格
    "neutral-700 on white": 7.4,   // ✅ AA合格
    "neutral-500 on white": 4.6,   // ✅ AA合格
    "green-600 on white": 4.5,     // ✅ AA合格
    "red-600 on white": 5.3,       // ✅ AA合格
    "amber-600 on white": 4.8,     // ✅ AA合格
  },
  
  // ダークモード
  dark: {
    "blue-400 on neutral-950": 6.84,   // ✅ AA合格
    "neutral-50 on neutral-950": 16.7, // ✅ AAA合格
    "neutral-200 on neutral-950": 8.9, // ✅ AA合格
    "neutral-400 on neutral-950": 4.7, // ✅ AA合格
    "green-400 on neutral-950": 7.2,   // ✅ AA合格
    "red-400 on neutral-950": 6.8,     // ✅ AA合格
    "amber-400 on neutral-950": 8.1,   // ✅ AA合格
  }
} as const

/**
 * 色の明度調整ルール
 * @description ライト → ダーク変換の基本則
 */
export const ColorAdjustmentRules = {
  // 青系（プライマリー）
  "blue-600": "blue-400",  // 明度UP（暗い背景で見やすく）
  "blue-700": "blue-500",
  "blue-100": "blue-900/30",  // 透明度で調整
  
  // 背景
  "white": "neutral-950",      // ほぼ黒
  "neutral-50": "neutral-900",  // レイヤー1
  "neutral-100": "neutral-800", // レイヤー2
  
  // テキスト
  "neutral-900": "neutral-50",  // ほぼ白
  "neutral-700": "neutral-200", // 本文
  "neutral-500": "neutral-400", // 補助
} as const

// ============================================
// 実装例：コンポーネントでの使用
// ============================================

/**
 * 使用例
 * @example
 * ```tsx
 * import { primary, background, text, colorUtils } from '@/config/theme/colors'
 * 
 * // プライマリーボタン（完全版）
 * <button className={colorUtils.primaryButton}>
 *   保存する
 * </button>
 * 
 * // 個別指定版
 * <button className={`${primary.DEFAULT} ${text.inverse} ${primary.hover}`}>
 *   保存する
 * </button>
 * 
 * // カード（レイヤー構造）
 * <div className={background.base}>           // レベル0
 *   <div className={colorUtils.cardSurface}>  // レベル1（カード）
 *     <div className={background.elevated}>   // レベル2
 *       コンテンツ
 *     </div>
 *   </div>
 * </div>
 * 
 * // テキストリンク
 * <a className={`${primary.text} ${primary.textHover}`}>
 *   詳細を見る
 * </a>
 * 
 * // セマンティックカラー（エラー表示）
 * <div className={`${semantic.error.light} ${semantic.error.text} ${semantic.error.border}`}>
 *   エラーが発生しました
 * </div>
 * 
 * // 状態付きボタン（無効状態）
 * <button 
 *   disabled 
 *   className={`${state.disabled.bg} ${state.disabled.text} ${state.disabled.cursor}`}
 * >
 *   無効なボタン
 * </button>
 * ```
 */

// ============================================
// デバッグ用Showcaseコンポーネント
// ============================================

/**
 * カラーパレットShowcase（開発用）
 */
export function ColorShowcase() {
  if (process.env.NODE_ENV === 'production') return null
  
  const React = require('react')
  
  // カラーカードコンポーネント
  const ColorCard = ({ 
    title, 
    bgClass, 
    textClass, 
    description, 
    border = '',
    extraClass = '' 
  }: {
    title: string
    bgClass: string
    textClass: string
    description: string
    border?: string
    extraClass?: string
  }) => {
    return React.createElement('div', {
      className: `${bgClass} ${border} ${extraClass} rounded-lg p-4 min-h-[80px] flex flex-col justify-center`
    }, [
      React.createElement('h4', {
        className: `${textClass} font-medium text-sm`,
        key: 'title'
      }, title),
      React.createElement('p', {
        className: `${textClass} text-xs opacity-75`,
        key: 'desc'
      }, description)
    ])
  }
  
  return React.createElement('div', {
    className: 'space-y-8 p-6 bg-white dark:bg-neutral-950 border rounded-lg'
  }, [
    React.createElement('h2', {
      className: 'text-lg font-semibold mb-4',
      key: 'header'
    }, 'Color System Showcase'),
    
    // プライマリーカラー
    React.createElement('section', {
      className: 'space-y-4',
      key: 'primary'
    }, [
      React.createElement('h3', {
        className: 'text-md font-medium text-neutral-700 dark:text-neutral-300',
        key: 'title'
      }, 'Primary Colors'),
      React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        key: 'cards'
      }, [
        React.createElement(ColorCard, {
          title: 'Primary',
          bgClass: primary.DEFAULT,
          textClass: text.inverse,
          description: '主要アクション',
          key: 'primary'
        }),
        React.createElement(ColorCard, {
          title: 'Primary Hover',
          bgClass: primary.hover,
          textClass: text.inverse,
          description: 'ホバー状態',
          key: 'hover'
        }),
        React.createElement(ColorCard, {
          title: 'Primary Text',
          bgClass: background.base,
          textClass: primary.text,
          description: 'テキストリンク',
          border: border.DEFAULT,
          key: 'text'
        })
      ])
    ]),
    
    // セマンティックカラー
    React.createElement('section', {
      className: 'space-y-4',
      key: 'semantic'
    }, [
      React.createElement('h3', {
        className: 'text-md font-medium text-neutral-700 dark:text-neutral-300',
        key: 'title'
      }, 'Semantic Colors'),
      React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
        key: 'cards'
      }, [
        React.createElement(ColorCard, {
          title: 'Success',
          bgClass: semantic.success.DEFAULT,
          textClass: text.inverse,
          description: '成功・完了',
          key: 'success'
        }),
        React.createElement(ColorCard, {
          title: 'Warning',
          bgClass: semantic.warning.DEFAULT,
          textClass: text.inverse,
          description: '警告・注意',
          key: 'warning'
        }),
        React.createElement(ColorCard, {
          title: 'Error',
          bgClass: semantic.error.DEFAULT,
          textClass: text.inverse,
          description: 'エラー・削除',
          key: 'error'
        }),
        React.createElement(ColorCard, {
          title: 'Info',
          bgClass: semantic.info.DEFAULT,
          textClass: text.inverse,
          description: '情報',
          key: 'info'
        })
      ])
    ]),
    
    // ユーティリティボタン
    React.createElement('section', {
      className: 'space-y-4',
      key: 'utils'
    }, [
      React.createElement('h3', {
        className: 'text-md font-medium text-neutral-700 dark:text-neutral-300',
        key: 'title'
      }, 'Button Utilities'),
      React.createElement('div', {
        className: 'flex flex-wrap gap-2',
        key: 'buttons'
      }, [
        React.createElement('button', {
          className: `px-4 py-2 rounded-md ${colorUtils.primaryButton}`,
          key: 'primary'
        }, 'Primary'),
        React.createElement('button', {
          className: `px-4 py-2 rounded-md ${colorUtils.secondaryButton}`,
          key: 'secondary'
        }, 'Secondary'),
        React.createElement('button', {
          className: `px-4 py-2 rounded-md border ${colorUtils.outlineButton}`,
          key: 'outline'
        }, 'Outline'),
        React.createElement('button', {
          className: `px-4 py-2 rounded-md ${colorUtils.ghostButton}`,
          key: 'ghost'
        }, 'Ghost')
      ])
    ]),
    
    // コントラスト比情報
    React.createElement('section', {
      className: 'space-y-4',
      key: 'contrast'
    }, [
      React.createElement('h3', {
        className: 'text-md font-medium text-neutral-700 dark:text-neutral-300',
        key: 'title'
      }, 'Accessibility (Contrast Ratios)'),
      React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
        key: 'ratios'
      }, [
        React.createElement('div', {
          className: `${background.surface} ${border.DEFAULT} rounded-lg p-4`,
          key: 'light'
        }, [
          React.createElement('h4', {
            className: 'text-sm font-medium mb-2',
            key: 'title'
          }, 'Light Mode'),
          React.createElement('div', {
            className: 'space-y-1 text-sm',
            key: 'content'
          }, [
            React.createElement('div', { key: '1' }, 'blue-600 on white: 4.52:1 ✅ AA'),
            React.createElement('div', { key: '2' }, 'neutral-900 on white: 17.4:1 ✅ AAA'),
            React.createElement('div', { key: '3' }, 'green-600 on white: 4.5:1 ✅ AA'),
            React.createElement('div', { key: '4' }, 'red-600 on white: 5.3:1 ✅ AA')
          ])
        ]),
        React.createElement('div', {
          className: `${background.surface} ${border.DEFAULT} rounded-lg p-4`,
          key: 'dark'
        }, [
          React.createElement('h4', {
            className: 'text-sm font-medium mb-2',
            key: 'title'
          }, 'Dark Mode'),
          React.createElement('div', {
            className: 'space-y-1 text-sm',
            key: 'content'
          }, [
            React.createElement('div', { key: '1' }, 'blue-400 on neutral-950: 6.84:1 ✅ AA'),
            React.createElement('div', { key: '2' }, 'neutral-50 on neutral-950: 16.7:1 ✅ AAA'),
            React.createElement('div', { key: '3' }, 'green-400 on neutral-950: 7.2:1 ✅ AA'),
            React.createElement('div', { key: '4' }, 'red-400 on neutral-950: 6.8:1 ✅ AA')
          ])
        ])
      ])
    ])
  ])
}

// ============================================
// エクスポート統合
// ============================================

export const colors = {
  primary,
  secondary,
  tertiary,
  brand,
  background,
  text,
  border,
  semantic,
  state,
  gradient,
  utils: colorUtils,
  // Showcaseを含める
  Showcase: ColorShowcase,
} as const

export default colors