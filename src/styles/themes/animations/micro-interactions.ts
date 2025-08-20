/**
 * マイクロインタラクションシステム - BoxLog統一仕様
 * ユーザー操作に対する即座のフィードバックを提供
 */

import { primitiveTransitions } from '../design-tokens'

// ===== ホバーエフェクト =====

export const hoverEffects = {
  // スケール変化
  scale: {
    subtle: 'hover:scale-[1.01] transition-transform duration-200 ease-out',
    normal: 'hover:scale-[1.02] transition-transform duration-200 ease-out',
    pronounced: 'hover:scale-105 transition-transform duration-200 ease-out',
  },
  
  // リフト効果（影とY軸移動）
  lift: {
    subtle: 'hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 ease-out',
    normal: 'hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out',
    pronounced: 'hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out',
  },
  
  // グロウ効果（影の色付き）
  glow: {
    primary: 'hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300 ease-out',
    secondary: 'hover:shadow-secondary/20 hover:shadow-lg transition-shadow duration-300 ease-out',
    accent: 'hover:shadow-accent/20 hover:shadow-lg transition-shadow duration-300 ease-out',
    success: 'hover:shadow-green-500/20 hover:shadow-lg transition-shadow duration-300 ease-out',
    warning: 'hover:shadow-yellow-500/20 hover:shadow-lg transition-shadow duration-300 ease-out',
    error: 'hover:shadow-red-500/20 hover:shadow-lg transition-shadow duration-300 ease-out',
  },
  
  // 色の変化
  color: {
    primary: 'hover:bg-primary/10 transition-colors duration-200 ease-out',
    secondary: 'hover:bg-secondary/80 transition-colors duration-200 ease-out',
    accent: 'hover:bg-accent/10 transition-colors duration-200 ease-out',
    subtle: 'hover:bg-muted/50 transition-colors duration-200 ease-out',
  },
  
  // ボーダー効果
  border: {
    grow: 'hover:border-2 hover:border-primary transition-all duration-200 ease-out',
    glow: 'hover:border-primary hover:shadow-sm transition-all duration-200 ease-out',
    fade: 'hover:border-opacity-100 transition-all duration-200 ease-out',
  },
  
  // 結合エフェクト
  combined: {
    button: 'hover:scale-[1.02] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out',
    card: 'hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out',
    input: 'hover:border-primary/50 hover:shadow-sm transition-all duration-200 ease-out',
  },
} as const

// ===== クリック・アクティブエフェクト =====

export const clickEffects = {
  // プレス効果
  press: {
    subtle: 'active:scale-[0.99] active:translate-y-px transition-transform duration-100 ease-out',
    normal: 'active:scale-[0.98] active:translate-y-0.5 transition-transform duration-100 ease-out',
    pronounced: 'active:scale-95 active:translate-y-1 transition-transform duration-100 ease-out',
  },
  
  // 波紋効果（リップル）
  ripple: {
    base: 'relative overflow-hidden before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-all before:duration-300 active:before:opacity-20 active:before:scale-100',
    primary: 'relative overflow-hidden before:absolute before:inset-0 before:bg-primary before:opacity-0 before:scale-0 before:rounded-full before:transition-all before:duration-300 active:before:opacity-20 active:before:scale-100',
    subtle: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white before:opacity-0 before:scale-0 before:rounded-full before:transition-all before:duration-200 active:before:opacity-10 active:before:scale-100',
  },
  
  // 色の変化
  color: {
    primary: 'active:bg-primary/90 transition-colors duration-100 ease-out',
    secondary: 'active:bg-secondary/60 transition-colors duration-100 ease-out',
    muted: 'active:bg-muted/80 transition-colors duration-100 ease-out',
  },
  
  // 影の変化
  shadow: {
    reduce: 'active:shadow-sm transition-shadow duration-100 ease-out',
    increase: 'active:shadow-lg transition-shadow duration-100 ease-out',
  },
} as const

// ===== フォーカスエフェクト =====

export const focusEffects = {
  // リング効果
  ring: {
    default: 'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-shadow duration-200',
    subtle: 'focus:ring-1 focus:ring-primary/50 focus:ring-offset-1 transition-shadow duration-200',
    pronounced: 'focus:ring-4 focus:ring-primary/30 focus:ring-offset-2 transition-shadow duration-200',
    error: 'focus:ring-2 focus:ring-destructive focus:ring-offset-2 transition-shadow duration-200',
    success: 'focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-shadow duration-200',
  },
  
  // アウトライン効果
  outline: {
    default: 'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    subtle: 'focus-visible:outline-1 focus-visible:outline-primary/50 focus-visible:outline-offset-1',
    dashed: 'focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-primary',
  },
  
  // ボーダー効果
  border: {
    default: 'focus:border-primary focus:border-2 transition-colors duration-200',
    glow: 'focus:border-primary focus:shadow-sm focus:shadow-primary/20 transition-all duration-200',
  },
  
  // 背景効果
  background: {
    subtle: 'focus:bg-primary/5 transition-colors duration-200',
    normal: 'focus:bg-primary/10 transition-colors duration-200',
  },
} as const

// ===== 状態遷移エフェクト =====

export const stateTransitions = {
  // 無効化状態
  disabled: {
    default: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-opacity duration-200',
    subtle: 'disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-200',
    grayscale: 'disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all duration-200',
  },
  
  // ロード状態
  loading: {
    opacity: 'data-loading:opacity-60 data-loading:cursor-wait transition-opacity duration-200',
    blur: 'data-loading:blur-sm data-loading:pointer-events-none transition-all duration-200',
    pulse: 'data-loading:animate-pulse data-loading:cursor-wait',
  },
  
  // 選択状態
  selected: {
    background: 'data-selected:bg-primary/10 data-selected:border-primary transition-all duration-200',
    scale: 'data-selected:scale-[1.02] data-selected:shadow-md transition-all duration-200',
    glow: 'data-selected:shadow-primary/20 data-selected:shadow-lg transition-shadow duration-200',
  },
  
  // エラー状態
  error: {
    shake: 'data-error:animate-shake data-error:border-destructive transition-colors duration-200',
    glow: 'data-error:shadow-destructive/20 data-error:shadow-lg data-error:border-destructive transition-all duration-200',
    background: 'data-error:bg-destructive/5 data-error:border-destructive transition-all duration-200',
  },
} as const

// ===== 複合インタラクション =====

export const compositeInteractions = {
  // ボタン用
  button: {
    primary: [
      hoverEffects.scale.normal,
      clickEffects.press.normal,
      focusEffects.ring.default,
      stateTransitions.disabled.default,
    ].join(' '),
    
    secondary: [
      hoverEffects.lift.subtle,
      clickEffects.press.subtle,
      focusEffects.ring.subtle,
      stateTransitions.disabled.default,
    ].join(' '),
    
    ghost: [
      hoverEffects.color.subtle,
      clickEffects.press.subtle,
      focusEffects.background.subtle,
      stateTransitions.disabled.default,
    ].join(' '),
  },
  
  // カード用
  card: {
    interactive: [
      hoverEffects.lift.normal,
      clickEffects.press.subtle,
      focusEffects.ring.subtle,
    ].join(' '),
    
    clickable: [
      hoverEffects.combined.card,
      clickEffects.press.subtle,
      focusEffects.ring.default,
    ].join(' '),
  },
  
  // インプット用
  input: {
    default: [
      hoverEffects.combined.input,
      focusEffects.ring.default,
      stateTransitions.disabled.default,
      stateTransitions.error.glow,
    ].join(' '),
    
    subtle: [
      hoverEffects.border.fade,
      focusEffects.border.default,
      stateTransitions.disabled.subtle,
    ].join(' '),
  },
  
  // アイコンボタン用
  iconButton: {
    default: [
      hoverEffects.scale.subtle,
      hoverEffects.color.primary,
      clickEffects.press.subtle,
      focusEffects.ring.subtle,
    ].join(' '),
    
    pronounced: [
      hoverEffects.scale.normal,
      hoverEffects.glow.primary,
      clickEffects.press.normal,
      focusEffects.ring.default,
    ].join(' '),
  },
  
  // リスト項目用
  listItem: {
    default: [
      hoverEffects.color.subtle,
      clickEffects.color.muted,
      focusEffects.background.subtle,
    ].join(' '),
    
    selectable: [
      hoverEffects.color.subtle,
      clickEffects.color.muted,
      focusEffects.background.subtle,
      stateTransitions.selected.background,
    ].join(' '),
  },
} as const

// ===== カスタムキーフレーム =====

export const microKeyframes = {
  // 波紋効果
  ripple: {
    '0%': {
      transform: 'scale(0)',
      opacity: '1',
    },
    '100%': {
      transform: 'scale(4)',
      opacity: '0',
    },
  },
  
  // エラー時のシェイク
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
  },
  
  // ハートビート
  heartbeat: {
    '0%': { transform: 'scale(1)' },
    '14%': { transform: 'scale(1.1)' },
    '28%': { transform: 'scale(1)' },
    '42%': { transform: 'scale(1.1)' },
    '70%': { transform: 'scale(1)' },
  },
  
  // フワッと現れる
  fadeInUp: {
    '0%': {
      opacity: '0',
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: '1',
      transform: 'translateY(0)',
    },
  },
  
  // 回転フェード
  rotateIn: {
    '0%': {
      opacity: '0',
      transform: 'rotate(-180deg)',
    },
    '100%': {
      opacity: '1',
      transform: 'rotate(0deg)',
    },
  },
} as const

// ===== ユーティリティ関数 =====

/**
 * アニメーション無効化チェック
 */
export const withReducedMotion = (animation: string, fallback: string = '') => {
  return `motion-safe:${animation} motion-reduce:${fallback || 'transition-none'}`
}

/**
 * 複数のエフェクトを組み合わせる
 */
export const combineEffects = (...effects: string[]) => {
  return effects.filter(Boolean).join(' ')
}

/**
 * レスポンシブアニメーション
 */
export const responsiveAnimation = {
  mobile: (effect: string) => `sm:${effect}`,
  tablet: (effect: string) => `md:${effect}`,
  desktop: (effect: string) => `lg:${effect}`,
}

/**
 * パフォーマンス最適化クラス
 */
export const performanceOptimizations = {
  // GPUアクセラレーション
  gpu: 'transform-gpu',
  // will-change最適化
  willChange: {
    transform: 'will-change-transform',
    scroll: 'will-change-scroll',
    contents: 'will-change-contents',
    auto: 'will-change-auto',
  },
  // レイヤー最適化
  layer: 'translate-z-0',
  // アンチエイリアス
  antialiased: 'antialiased',
} as const