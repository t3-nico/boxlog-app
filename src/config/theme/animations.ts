/**
 * BoxLog アニメーションシステム
 * 統一感のあるマイクロインタラクション
 */

// ============================================
// トランジション（基本の動き）
// ============================================

export const transition = {
  /**
   * デフォルト
   * @usage ほとんどの要素
   * @duration 200ms
   */
  default: 'transition-all duration-200 ease-in-out',
  
  /**
   * 高速
   * @usage ホバー、小さな変化
   * @duration 150ms
   */
  fast: 'transition-all duration-150 ease-in-out',
  
  /**
   * 通常
   * @usage 一般的な変化
   * @duration 300ms
   */
  normal: 'transition-all duration-300 ease-in-out',
  
  /**
   * ゆっくり
   * @usage モーダル、大きな変化
   * @duration 500ms
   */
  slow: 'transition-all duration-500 ease-in-out',
  
  /**
   * 色のみ
   * @usage ホバー色変化
   */
  colors: 'transition-colors duration-200 ease-in-out',
  
  /**
   * 変形のみ
   * @usage スケール、回転
   */
  transform: 'transition-transform duration-200 ease-in-out',
  
  /**
   * 不透明度のみ
   * @usage フェード
   */
  opacity: 'transition-opacity duration-200 ease-in-out',
}

// ============================================
// ホバーアニメーション
// ============================================

export const hover = {
  /**
   * スケール（拡大）
   * @usage ボタン、カード
   */
  scale: 'hover:scale-105 transition-transform duration-200',
  scaleSmall: 'hover:scale-102 transition-transform duration-200',
  
  /**
   * 持ち上げ（影）
   * @usage カード、パネル
   */
  lift: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
  liftSmall: 'hover:shadow-md hover:-translate-y-px transition-all duration-200',
  
  /**
   * 明度変化
   * @usage リンク、テキスト
   */
  brightness: 'hover:brightness-110 transition-all duration-200',
  
  /**
   * 透明度
   * @usage アイコン、画像
   */
  opacity: 'hover:opacity-80 transition-opacity duration-200',
  
  /**
   * グロー（発光）
   * @usage 重要なボタン
   */
  glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow duration-300',
}

// ============================================
// ローディング
// ============================================

export const loading = {
  /**
   * スピナー
   * @usage 読み込み中
   */
  spinner: 'animate-spin',
  
  /**
   * パルス
   * @usage スケルトン
   */
  pulse: 'animate-pulse',
  
  /**
   * ドット
   * @usage テキスト後ろの「...」
   */
  dots: 'animate-pulse [animation-delay:200ms]',
  
  /**
   * プログレスバー
   * @usage 進捗表示
   */
  progress: 'animate-[progress_2s_ease-in-out_infinite]',
  
  /**
   * スケルトン
   * @usage コンテンツローディング
   */
  skeleton: 'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 animate-[shimmer_2s_infinite]',
}

// ============================================
// 出現・消失
// ============================================

export const appear = {
  /**
   * フェードイン
   * @usage モーダル、ポップアップ
   */
  fadeIn: 'animate-in fade-in duration-200',
  
  /**
   * スライドイン（上から）
   * @usage ドロップダウン
   */
  slideDown: 'animate-in slide-in-from-top duration-200',
  
  /**
   * スライドイン（下から）
   * @usage トースト、通知
   */
  slideUp: 'animate-in slide-in-from-bottom duration-300',
  
  /**
   * スライドイン（右から）
   * @usage サイドパネル
   */
  slideLeft: 'animate-in slide-in-from-right duration-300',
  
  /**
   * ズームイン
   * @usage モーダル、画像
   */
  zoomIn: 'animate-in zoom-in-95 duration-200',
  
  /**
   * フェードアウト
   * @usage 削除、非表示
   */
  fadeOut: 'animate-out fade-out duration-200',
}

// ============================================
// フィードバック
// ============================================

export const feedback = {
  /**
   * 成功
   * @usage 保存完了
   */
  success: 'animate-[success_0.5s_ease-in-out]',
  
  /**
   * エラー（振動）
   * @usage バリデーションエラー
   */
  shake: 'animate-[shake_0.5s_ease-in-out]',
  
  /**
   * バウンス
   * @usage 注目を集める
   */
  bounce: 'animate-bounce',
  
  /**
   * パルス（1回）
   * @usage クリックフィードバック
   */
  ping: 'animate-ping [animation-iteration-count:1]',
  
  /**
   * リップル（波紋）
   * @usage ボタンクリック
   */
  ripple: 'animate-[ripple_0.6s_ease-out]',
}

// ============================================
// カスタムキーフレーム定義
// ============================================

export const keyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  
  @keyframes success {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  
  @keyframes ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
  
  @keyframes progress {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0); }
    100% { transform: translateX(100%); }
  }
`

// ============================================
// 実用パターン
// ============================================

export const patterns = {
  /**
   * ボタンクリック
   * @usage 全ボタン
   */
  button: `${transition.fast} ${hover.scaleSmall} active:scale-95`,
  
  /**
   * カードホバー
   * @usage カードコンポーネント
   */
  card: `${transition.default} ${hover.lift}`,
  
  /**
   * リンクホバー
   * @usage テキストリンク
   */
  link: `${transition.colors} ${hover.opacity}`,
  
  /**
   * モーダル表示
   * @usage ダイアログ
   */
  modal: `${appear.zoomIn} ${appear.fadeIn}`,
  
  /**
   * ドロップダウン
   * @usage メニュー
   */
  dropdown: `${appear.slideDown} ${appear.fadeIn}`,
  
  /**
   * トースト
   * @usage 通知
   */
  toast: `${appear.slideUp} ${appear.fadeIn}`,
  
  /**
   * スケルトンローディング
   * @usage 読み込み中
   */
  skeleton: loading.skeleton,
}

// ============================================
// BoxLogアニメーション方針
// ============================================

export const animationGuide = {
  // 基本ルール
  duration: {
    hover: '150-200ms',     // 素早く
    modal: '300-500ms',     // ゆっくり
    loading: '無限ループ',
  },
  
  // 用途別推奨
  usage: {
    button: 'hover.scale + active:scale-95',
    card: 'hover.lift',
    link: 'transition.colors',
    loading: 'loading.spinner or skeleton',
    error: 'feedback.shake',
  },
  
  // パフォーマンス
  performance: {
    recommended: 'transform/opacity（GPUアクセラレーション）',
    avoid: 'margin/padding（リフロー発生）',
  },
  
  // BoxLog方針
  philosophy: {
    speed: '200ms標準（速すぎず遅すぎず）',
    easing: 'ease-in-out（自然な動き）',
    necessity: '必要最小限（生産性を妨げない）',
    subtlety: '派手な動きは避ける（プロダクティビティツール）',
  },
} as const

// ============================================
// ユーティリティ関数
// ============================================

/**
 * アニメーション遅延を生成
 */
export function getAnimationDelay(index: number, baseDelay = 100): string {
  return `[animation-delay:${index * baseDelay}ms]`
}

/**
 * ステージド アニメーション（順次表示）
 */
export function getStagedAnimation(index: number): string {
  return `animate-in fade-in slide-in-from-bottom duration-300 ${getAnimationDelay(index)}`
}

/**
 * ローディング状態の判定
 */
export function getLoadingAnimation(isLoading: boolean): string {
  return isLoading ? loading.skeleton : ''
}

/**
 * 条件付きアニメーション
 */
export function getConditionalAnimation(condition: boolean, animation: string): string {
  return condition ? animation : ''
}

/**
 * アニメーション組み合わせ
 */
export function combineAnimations(...animations: string[]): string {
  return animations.filter(Boolean).join(' ')
}

// ============================================
// レガシー互換性維持
// ============================================

/**
 * 既存コードとの互換性維持
 * @deprecated 新規開発では上記の新しいシステムを使用してください
 */
export const animations = {
  transition: {
    fast: transition.fast,
    default: transition.default,
    slow: transition.slow,
  },
  hover: {
    lift: hover.lift,
    scale: hover.scale,
    opacity: hover.opacity,
  },
  fade: {
    in: appear.fadeIn,
    out: appear.fadeOut,
  },
} as const

// ============================================
// 型定義
// ============================================

export type TransitionType = keyof typeof transition
export type HoverType = keyof typeof hover
export type LoadingType = keyof typeof loading
export type AppearType = keyof typeof appear
export type FeedbackType = keyof typeof feedback
export type PatternType = keyof typeof patterns

// ============================================
// 使用例
// ============================================

/**
 * 実装例
 * @example
 * ```tsx
 * // ボタン
 * <button className={`px-4 py-2 ${patterns.button}`}>
 *   クリックできます
 * </button>
 * 
 * // カード
 * <div className={`p-6 rounded-lg ${patterns.card}`}>
 *   ホバーで浮き上がります
 * </div>
 * 
 * // ローディング
 * <div className={loading.spinner}>
 *   <Loader className="w-5 h-5" />
 * </div>
 * 
 * // スケルトン
 * <div className={`h-4 w-full rounded ${loading.skeleton}`} />
 * 
 * // モーダル
 * {isOpen && (
 *   <div className={patterns.modal}>
 *     モーダルコンテンツ
 *   </div>
 * )}
 * 
 * // ステージドアニメーション
 * {items.map((item, index) => (
 *   <div key={item.id} className={getStagedAnimation(index)}>
 *     {item.name}
 *   </div>
 * ))}
 * 
 * // 条件付きアニメーション
 * <input 
 *   className={combineAnimations(
 *     'border rounded px-3 py-2',
 *     getConditionalAnimation(hasError, feedback.shake),
 *     hasError ? 'border-red-500' : 'border-neutral-300'
 *   )}
 * />
 * 
 * // ボタンインタラクション例
 * function AnimatedButton({ children, variant = 'default' }) {
 *   const baseClasses = 'px-4 py-2 rounded-md'
 *   const animationClasses = patterns.button
 *   
 *   return (
 *     <button className={combineAnimations(baseClasses, animationClasses)}>
 *       {children}
 *     </button>
 *   )
 * }
 * 
 * // カードホバー例
 * function AnimatedCard({ children }) {
 *   return (
 *     <div className={combineAnimations(
 *       'p-6 bg-white rounded-lg border',
 *       patterns.card
 *     )}>
 *       {children}
 *     </div>
 *   )
 * }
 * 
 * // ローディング例
 * function LoadingState() {
 *   return (
 *     <div className="space-y-3">
 *       <div className={combineAnimations('h-4 bg-neutral-200 rounded', loading.skeleton)} />
 *       <div className={combineAnimations('h-4 bg-neutral-200 rounded w-3/4', loading.skeleton)} />
 *     </div>
 *   )
 * }
 * 
 * // エラー時の振動例
 * function ErrorInput({ error, ...props }) {
 *   return (
 *     <input 
 *       className={combineAnimations(
 *         'border rounded px-3 py-2',
 *         getConditionalAnimation(error, feedback.shake),
 *         error ? 'border-red-500' : 'border-neutral-300'
 *       )}
 *       {...props}
 *     />
 *   )
 * }
 * ```
 */