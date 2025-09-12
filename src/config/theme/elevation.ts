/**
 * BoxLog エレベーションシステム
 * Slack型ハイブリッド：必要最小限の影
 */

// ============================================
// 境界線（常設UIで使用）
// ============================================

export const borders = {
  /**
   * 通常の境界線
   * @usage カード、セクション区切り
   */
  default: 'border border-neutral-200 dark:border-neutral-800',
  
  /**
   * ホバー時
   * @usage インタラクティブ要素
   */
  hover: 'hover:border-neutral-300 dark:hover:border-neutral-700',
  
  /**
   * アクティブ/選択
   * @usage 選択されたアイテム
   */
  active: 'border-blue-500 dark:border-blue-400',
  
  /**
   * フォーカス
   * @usage フォーカス時
   */
  focus: 'ring-2 ring-blue-500 ring-offset-2',
  
  /**
   * エラー
   * @usage バリデーションエラー
   */
  error: 'border-red-500 dark:border-red-400',
  
  /**
   * 成功
   * @usage 成功状態
   */
  success: 'border-green-500 dark:border-green-400',
  
}

// ============================================
// エレベーション（一時的UIのみ）
// ============================================

export const elevation = {
  /**
   * なし
   * @usage 通常のカード、常設UI
   */
  none: '',
  
  /**
   * 小（ほぼ使わない）
   * @usage 微妙な階層差
   */
  sm: 'shadow-sm',
  
  /**
   * 中
   * @usage ドロップダウン、ポップオーバー
   */
  md: 'shadow-md border border-neutral-200 dark:border-neutral-700',
  
  /**
   * 大
   * @usage モーダル、ダイアログ
   */
  lg: 'shadow-lg',
  
  /**
   * 特大
   * @usage 最前面のオーバーレイ
   */
  xl: 'shadow-xl',
}

// ============================================
// 実用パターン
// ============================================

export const patterns = {
  /**
   * 常設UI（影なし）
   */
  card: {
    default: borders.default,
  },
  sidebar: borders.default,
  input: borders.default,
  button: borders.default,
  
  /**
   * 一時的UI（影あり）
   */
  dropdown: elevation.md,
  modal: elevation.lg,
  tooltip: elevation.md,
  contextMenu: elevation.md,
  popover: elevation.md,
  dialog: elevation.xl,
  
  /**
   * ホバー（影なし→境界線変化）
   */
  cardHover: `${borders.default} ${borders.hover}`,
  inputHover: `${borders.default} ${borders.hover}`,
  buttonHover: `${borders.default} ${borders.hover}`,
  
  /**
   * 選択状態（影なし→色変化）
   */
  cardActive: `${borders.active} bg-blue-50 dark:bg-blue-900/10`,
  inputActive: `${borders.active}`,
  buttonActive: `${borders.active}`,
  
  /**
   * 状態表示
   */
  cardError: `${borders.error} bg-red-50 dark:bg-red-900/10`,
  cardSuccess: `${borders.success} bg-green-50 dark:bg-green-900/10`,
  inputError: borders.error,
  inputSuccess: borders.success,
}

// ============================================
// BoxLogエレベーション方針
// ============================================

export const elevationGuide = {
  // 基本方針
  philosophy: {
    approach: 'Slackライクなハイブリッド',
    permanent: '境界線のみ（影なし）',
    temporary: '影あり（階層明確化）',
    minimal: '必要最小限の定義',
  },
  
  // 使い分け
  usage: {
    permanent: {
      description: '常設UI（画面に常にある要素）',
      examples: ['カード', 'サイドバー', '入力欄', 'ボタン'],
      style: '境界線のみ',
      reason: '画面がうるさくならない',
    },
    temporary: {
      description: '一時的UI（ユーザー操作で現れる）',
      examples: ['ドロップダウン', 'モーダル', 'ツールチップ', 'コンテキストメニュー'],
      style: '影あり',
      reason: '階層を明確に表現',
    },
  },
  
  // 他サービス比較
  comparison: {
    flatDesign: ['Linear', 'Vercel'],
    hybrid: ['Slack', 'Discord', 'VSCode', 'Figma'],
    shadowHeavy: ['Notion', 'Google Material'],
    boxlogChoice: 'hybrid',
  },
  
  // 実装ガイド
  implementation: {
    常設UI: 'borders.default + hover効果',
    一時UI: 'elevation.md/lg',
    選択状態: '境界線の色変化',
    フォーカス: 'ring効果',
  },
} as const

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 要素の種類に応じたエレベーションを取得
 */
export function getElevation(type: 'permanent' | 'temporary', level: keyof typeof elevation = 'none'): string {
  if (type === 'permanent') {
    return patterns.card
  }
  return elevation[level]
}

/**
 * 状態に応じた境界線を取得
 */
export function getBorderForState(state: 'default' | 'hover' | 'active' | 'focus' | 'error' | 'success'): string {
  return borders[state]
}

/**
 * カードの状態クラスを取得
 */
export function getCardClasses(state: {
  isHover?: boolean
  isActive?: boolean
  isError?: boolean
  isSuccess?: boolean
}): string {
  if (state.isError) return patterns.cardError
  if (state.isSuccess) return patterns.cardSuccess
  if (state.isActive) return patterns.cardActive
  if (state.isHover) return patterns.cardHover
  return patterns.card
}

/**
 * 入力欄の状態クラスを取得
 */
export function getInputClasses(state: {
  isHover?: boolean
  isActive?: boolean
  isError?: boolean
  isSuccess?: boolean
}): string {
  if (state.isError) return patterns.inputError
  if (state.isSuccess) return patterns.inputSuccess
  if (state.isActive) return patterns.inputActive
  if (state.isHover) return patterns.inputHover
  return patterns.input
}

/**
 * 一時的UIのエレベーションを取得
 */
export function getTemporaryUIElevation(component: 'dropdown' | 'modal' | 'tooltip' | 'contextMenu' | 'popover' | 'dialog'): string {
  return patterns[component]
}


// ============================================
// 型定義
// ============================================

export type BorderType = keyof typeof borders
export type ElevationType = keyof typeof elevation
export type PatternType = keyof typeof patterns
export type UIType = 'permanent' | 'temporary'
export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'error' | 'success'

// ============================================
// 使用例
// ============================================

/**
 * 実装例
 * @example
 * ```tsx
 * // 常設カード（影なし）
 * function TaskCard({ selected, error }) {
 *   return (
 *     <div className={getCardClasses({
 *       isActive: selected,
 *       isError: error
 *     })}>
 *       // 影なし、境界線のみ
 *     </div>
 *   )
 * }
 * 
 * // ドロップダウン（影あり）
 * function Dropdown() {
 *   return (
 *     <div className={`
 *       absolute mt-1 bg-white rounded-md
 *       ${getTemporaryUIElevation('dropdown')}
 *     `}>
 *       // 一時的UIなので影で浮かせる
 *     </div>
 *   )
 * }
 * 
 * // モーダル（影あり）
 * function Modal() {
 *   return (
 *     <div className="fixed inset-0 z-50 flex items-center justify-center">
 *       <div className={`
 *         bg-white rounded-lg
 *         ${getTemporaryUIElevation('modal')}
 *       `}>
 *         // 最前面なので影必須
 *       </div>
 *     </div>
 *   )
 * }
 * 
 * // 入力欄（状態管理）
 * function Input({ error, success, ...props }) {
 *   return (
 *     <input 
 *       className={getInputClasses({
 *         isError: error,
 *         isSuccess: success
 *       })}
 *       {...props}
 *     />
 *   )
 * }
 * 
 * // 条件付きエレベーション
 * function Card({ isPermanent, level = 'md' }) {
 *   const elevationClass = getElevation(
 *     isPermanent ? 'permanent' : 'temporary',
 *     level
 *   )
 *   
 *   return (
 *     <div className={`p-4 rounded-lg ${elevationClass}`}>
 *       コンテンツ
 *     </div>
 *   )
 * }
 * 
 * // 実際のBoxLogコンポーネント例
 * function BoxLogCard({ 
 *   children,
 *   isSelected = false,
 *   hasError = false,
 *   hasSuccess = false,
 *   className = ""
 * }) {
 *   return (
 *     <div 
 *       className={`
 *         p-6 rounded-lg
 *         ${getCardClasses({
 *           isActive: isSelected,
 *           isError: hasError,
 *           isSuccess: hasSuccess
 *         })}
 *         transition-colors duration-200
 *         ${className}
 *       `}
 *     >
 *       {children}
 *     </div>
 *   )
 * }
 * ```
 */