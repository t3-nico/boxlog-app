/**
 * アクセシビリティ対応アニメーションシステム - BoxLog統一仕様
 * prefers-reduced-motion対応、WCAG準拠、包括的デザイン
 */

// ===== Motion Reduction対応 =====

export const motionReduction = {
  // 基本的なモーション削減
  safe: {
    // アニメーション無効化
    none: 'motion-reduce:animate-none',
    // トランジション無効化
    noTransition: 'motion-reduce:transition-none',
    // 即座の変化
    instant: 'motion-reduce:duration-0',
    // 最小限のトランジション
    minimal: 'motion-reduce:transition-opacity motion-reduce:duration-200',
  },
  
  // 代替アニメーション
  alternative: {
    // フェードのみ
    fadeOnly: 'motion-safe:animate-slide-in motion-reduce:animate-fade-in',
    // 透明度変化のみ
    opacityOnly: 'motion-safe:transition-all motion-reduce:transition-opacity',
    // 色変化のみ
    colorOnly: 'motion-safe:transition-all motion-reduce:transition-colors',
    // スケール削減
    reduceScale: 'motion-safe:hover:scale-105 motion-reduce:hover:scale-100',
  },
  
  // 完全無効化
  disable: {
    animations: 'motion-reduce:animate-none motion-reduce:[animation-duration:0.01ms]',
    transitions: 'motion-reduce:transition-none motion-reduce:[transition-duration:0.01ms]',
    transforms: 'motion-reduce:transform-none',
    all: 'motion-reduce:animate-none motion-reduce:transition-none motion-reduce:transform-none',
  },
} as const

// ===== WCAG準拠アニメーション =====

export const wcagCompliant = {
  // 必須項目（WCAG 2.1 AA）
  essential: {
    // 5秒以下のアニメーション
    shortDuration: 'duration-200 motion-reduce:duration-0',
    // 一時停止可能
    pausable: 'animate-pause-on-hover motion-reduce:animate-none',
    // 低コントラスト回避
    highContrast: 'contrast-more:opacity-100 contrast-more:saturate-150',
  },
  
  // 推奨項目（WCAG 2.1 AAA）
  enhanced: {
    // 3秒以下のアニメーション
    ultraShort: 'duration-150 motion-reduce:duration-0',
    // 自動停止
    autoStop: '[animation-iteration-count:1] motion-reduce:animate-none',
    // ユーザー制御
    userControl: 'hover:animation-play-state-paused motion-reduce:animate-none',
  },
  
  // 前庭障害対応
  vestibular: {
    // 回転動作の制限
    noRotation: 'motion-reduce:rotate-0',
    // 振動動作の制限
    noShake: 'motion-reduce:animate-none',
    // 視差効果の制限
    noParallax: 'motion-reduce:transform-none',
    // ズーム制限
    noZoom: 'motion-reduce:scale-100',
  },
} as const

// ===== ユーザー設定適応 =====

export const userPreferences = {
  // 動きの設定
  motion: {
    // フル動作（デフォルト）
    full: 'motion-safe:animate-bounce motion-safe:transition-all',
    // 削減動作
    reduced: 'motion-reduce:animate-pulse motion-reduce:transition-opacity',
    // 動作なし
    none: 'motion-reduce:animate-none motion-reduce:transition-none',
  },
  
  // コントラスト設定
  contrast: {
    // 標準コントラスト
    normal: 'contrast-normal',
    // 高コントラスト
    high: 'contrast-more:contrast-150 contrast-more:saturate-200',
    // 低コントラスト
    low: 'contrast-less:contrast-75 contrast-less:saturate-50',
  },
  
  // 透明度設定
  transparency: {
    // 標準透明度
    normal: 'opacity-100',
    // 透明度削減
    reduced: 'opacity-reduce:opacity-100',
    // 透明度なし
    none: 'backdrop-opacity-100 bg-opacity-100',
  },
} as const

// ===== 段階的アニメーション =====

export const progressiveAnimation = {
  // レベル0: アニメーションなし
  level0: {
    transition: 'transition-none',
    animation: 'animate-none',
    transform: 'transform-none',
    description: 'Complete motion reduction',
  },
  
  // レベル1: 最小限の変化
  level1: {
    transition: 'transition-opacity duration-200',
    animation: 'animate-none',
    transform: 'transform-none',
    description: 'Opacity changes only',
  },
  
  // レベル2: 基本的な変化
  level2: {
    transition: 'transition-all duration-200 ease-out',
    animation: 'animate-pulse',
    transform: 'hover:scale-[1.01]',
    description: 'Basic transitions and subtle scaling',
  },
  
  // レベル3: 標準的なアニメーション
  level3: {
    transition: 'transition-all duration-300 ease-out',
    animation: 'animate-fade-in',
    transform: 'hover:scale-105 hover:-translate-y-1',
    description: 'Standard animations with movement',
  },
  
  // レベル4: 豊かなアニメーション
  level4: {
    transition: 'transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    animation: 'animate-bounce animate-slide-in',
    transform: 'hover:scale-110 hover:-translate-y-2 hover:rotate-1',
    description: 'Rich animations with complex easing',
  },
} as const

// ===== 包括的デザインパターン =====

export const inclusivePatterns = {
  // 視覚障害対応
  visualImpairment: {
    // スクリーンリーダー対応
    screenReader: 'sr-only motion-reduce:not-sr-only',
    // 高コントラスト対応
    highContrast: 'contrast-more:border-2 contrast-more:border-current',
    // 拡大対応
    zoomFriendly: 'text-base leading-relaxed p-4',
  },
  
  // 運動障害対応
  motorImpairment: {
    // 大きなクリック領域
    largeTarget: 'min-h-11 min-w-11 p-3',
    // ホバー不要
    noHoverRequired: 'focus:bg-primary/10 active:bg-primary/20',
    // 長押し対応
    longPress: 'touch-manipulation select-none',
  },
  
  // 認知障害対応
  cognitiveImpairment: {
    // シンプルなアニメーション
    simple: 'animate-fade-in duration-300',
    // 一貫した動作
    consistent: 'transition-all duration-200 ease-out',
    // 予測可能
    predictable: 'hover:opacity-80 focus:opacity-80',
  },
  
  // 前庭障害対応
  vestibularDisorder: {
    // 回転なし
    noRotation: 'rotate-0 motion-reduce:rotate-0',
    // 振動なし
    noVibration: 'motion-reduce:animate-none',
    // 視差なし
    noParallax: 'motion-reduce:translate-y-0',
  },
} as const

// ===== デバイス適応アクセシビリティ =====

export const deviceAccessibility = {
  // タッチデバイス
  touch: {
    // タッチフレンドリー
    friendly: 'touch-manipulation min-h-11 min-w-11',
    // ダブルタップ防止
    noDoubleTap: 'touch-manipulation select-none',
    // 精密タッチ
    precise: 'touch-manipulation pointer-fine:min-h-8 pointer-coarse:min-h-11',
  },
  
  // キーボードナビゲーション
  keyboard: {
    // フォーカス表示
    focus: 'focus:outline-2 focus:outline-primary focus:outline-offset-2',
    // フォーカス内表示
    focusWithin: 'focus-within:ring-2 focus-within:ring-primary',
    // フォーカス可視
    focusVisible: 'focus-visible:ring-2 focus-visible:ring-primary',
  },
  
  // スクリーンリーダー
  screenReader: {
    // 読み上げ対応
    readable: 'sr-only motion-reduce:not-sr-only',
    // ライブリージョン
    liveRegion: '[aria-live="polite"]',
    // 状態通知
    status: '[role="status"]',
  },
} as const

// ===== カスタムメディアクエリ =====

export const customMediaQueries = {
  // 高コントラスト
  highContrast: '@media (prefers-contrast: high)',
  
  // 透明度削減
  reducedTransparency: '@media (prefers-reduced-transparency: reduce)',
  
  // データ使用量削減
  reducedData: '@media (prefers-reduced-data: reduce)',
  
  // 明暗設定
  lightMode: '@media (prefers-color-scheme: light)',
  darkMode: '@media (prefers-color-scheme: dark)',
  
  // 組み合わせクエリ
  combined: {
    // ダークモード + 動き削減
    darkReducedMotion: '@media (prefers-color-scheme: dark) and (prefers-reduced-motion: reduce)',
    // 高コントラスト + 動き削減
    highContrastReducedMotion: '@media (prefers-contrast: high) and (prefers-reduced-motion: reduce)',
  },
} as const

// ===== ユーティリティ関数 =====

/**
 * アクセシブルなアニメーションクラスを生成
 */
export const createAccessibleAnimation = (
  animation: string,
  reducedMotionFallback: string = 'transition-opacity duration-200'
) => {
  return `motion-safe:${animation} motion-reduce:${reducedMotionFallback}`
}

/**
 * プログレッシブエンハンスメント
 */
export const progressiveEnhancement = (
  baseClasses: string,
  enhancedClasses: string,
  level: keyof typeof progressiveAnimation = 'level2'
) => {
  const config = progressiveAnimation[level]
  return `${baseClasses} motion-safe:${enhancedClasses} ${config.transition}`
}

/**
 * ユーザー設定に基づくクラス選択
 */
export const adaptToUserPreference = (
  preference: 'none' | 'reduced' | 'full' = 'full'
) => {
  const preferences = {
    none: motionReduction.disable.all,
    reduced: motionReduction.safe.minimal,
    full: 'transition-all duration-300 ease-out',
  }
  
  return preferences[preference]
}

/**
 * WCAG準拠チェック
 */
export const ensureWcagCompliance = (animationClass: string) => {
  const compliantClass = `${animationClass} ${wcagCompliant.essential.shortDuration} ${wcagCompliant.essential.pausable}`
  return createAccessibleAnimation(compliantClass)
}

/**
 * デバイス能力に基づく適応
 */
export const adaptToDevice = (deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop') => {
  const adaptations = {
    mobile: deviceAccessibility.touch.friendly,
    tablet: deviceAccessibility.touch.precise,
    desktop: deviceAccessibility.keyboard.focus,
  }
  
  return adaptations[deviceType]
}

/**
 * アクセシビリティ属性生成
 */
export const a11yAttributes = {
  // 動きのある要素用
  animated: {
    'aria-label': 'Animated content',
    'role': 'img',
    'aria-hidden': 'false',
  },
  
  // ローディング用
  loading: {
    'aria-label': 'Loading',
    'aria-live': 'polite',
    'aria-busy': 'true',
  },
  
  // インタラクティブ要素用
  interactive: {
    'tabindex': '0',
    'role': 'button',
    'aria-pressed': 'false',
  },
  
  // 状態変化用
  status: {
    'role': 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  },
} as const