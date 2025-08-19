/**
 * アニメーション設定 - トランジション、キーフレーム、イージング
 */

// イージング関数
export const easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // カスタムベジエ曲線
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const

// トランジション時間
export const duration = {
  fastest: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const

// 基本トランジション
export const transitions = {
  // 一般的なトランジション
  all: {
    fast: `all ${duration.fast} ${easing.standard}`,
    normal: `all ${duration.normal} ${easing.standard}`,
    slow: `all ${duration.slow} ${easing.standard}`,
  },
  
  // 色の変化
  colors: {
    fast: `background-color ${duration.fast} ${easing.standard}, color ${duration.fast} ${easing.standard}, border-color ${duration.fast} ${easing.standard}`,
    normal: `background-color ${duration.normal} ${easing.standard}, color ${duration.normal} ${easing.standard}, border-color ${duration.normal} ${easing.standard}`,
  },
  
  // 変形
  transform: {
    fast: `transform ${duration.fast} ${easing.standard}`,
    normal: `transform ${duration.normal} ${easing.standard}`,
    spring: `transform ${duration.normal} ${easing.spring}`,
    bounce: `transform ${duration.slow} ${easing.bounce}`,
  },
  
  // 透明度
  opacity: {
    fast: `opacity ${duration.fast} ${easing.standard}`,
    normal: `opacity ${duration.normal} ${easing.standard}`,
  },
  
  // ボックスシャドウ
  shadow: {
    fast: `box-shadow ${duration.fast} ${easing.standard}`,
    normal: `box-shadow ${duration.normal} ${easing.standard}`,
  },
} as const

// キーフレームアニメーション
export const keyframes = {
  // フェード
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  
  // スライド
  slideInUp: {
    from: { 
      opacity: '0',
      transform: 'translateY(20px) scale(0.95)' 
    },
    to: { 
      opacity: '1',
      transform: 'translateY(0) scale(1)' 
    },
  },
  slideInDown: {
    from: { 
      opacity: '0',
      transform: 'translateY(-20px)' 
    },
    to: { 
      opacity: '1',
      transform: 'translateY(0)' 
    },
  },
  slideInLeft: {
    from: { 
      opacity: '0',
      transform: 'translateX(-20px)' 
    },
    to: { 
      opacity: '1',
      transform: 'translateX(0)' 
    },
  },
  slideInRight: {
    from: { 
      opacity: '0',
      transform: 'translateX(20px)' 
    },
    to: { 
      opacity: '1',
      transform: 'translateX(0)' 
    },
  },
  
  // スケール
  scaleIn: {
    from: { 
      opacity: '0',
      transform: 'scale(0.95)' 
    },
    to: { 
      opacity: '1',
      transform: 'scale(1)' 
    },
  },
  scaleOut: {
    from: { 
      opacity: '1',
      transform: 'scale(1)' 
    },
    to: { 
      opacity: '0',
      transform: 'scale(0.95)' 
    },
  },
  
  // 回転
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  
  // パルス効果
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.7' },
  },
  
  // バウンス
  bounce: {
    '0%, 100%': { 
      transform: 'translateY(-25%)',
      animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' 
    },
    '50%': { 
      transform: 'translateY(0)',
      animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' 
    },
  },
  
  // シェイク（エラー時など）
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
  },
} as const

// カレンダー専用アニメーション
export const calendarAnimations = {
  // 現在時刻線のパルス
  currentTimePulse: {
    keyframes: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.7' },
    },
    duration: '2s',
    timing: easing.ease,
    iteration: 'infinite',
  },
  
  // ドラッグプレビューのパルス
  dragPreviewPulse: {
    keyframes: {
      '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' },
      '100%': { boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)' },
    },
    duration: '1.5s',
    timing: easing.easeOut,
    iteration: 'infinite',
  },
  
  // イベントブロックのホバー
  eventBlockHover: {
    transform: 'scale(1.02)',
    transition: transitions.transform.fast,
  },
  
  // ビュー切り替えアニメーション
  viewTransition: {
    enter: {
      keyframes: keyframes.slideInRight,
      duration: duration.normal,
      timing: easing.standard,
    },
    exit: {
      keyframes: {
        from: { opacity: '1', transform: 'translateX(0)' },
        to: { opacity: '0', transform: 'translateX(-20px)' },
      },
      duration: duration.normal,
      timing: easing.standard,
    },
  },
  
  // ミニカレンダーの日付選択
  miniCalendarDateSelect: {
    transform: 'scale(0.95)',
    transition: transitions.transform.fast,
  },
} as const

// コンポーネント別アニメーション
export const componentAnimations = {
  // ボタン
  button: {
    hover: {
      transform: 'translateY(-1px)',
      transition: transitions.transform.fast,
    },
    active: {
      transform: 'translateY(0)',
      transition: transitions.transform.fastest,
    },
    loading: {
      keyframes: keyframes.spin,
      duration: '1s',
      timing: easing.linear,
      iteration: 'infinite',
    },
  },
  
  // カード
  card: {
    hover: {
      transform: 'translateY(-2px)',
      transition: `${transitions.transform.normal}, ${transitions.shadow.normal}`,
    },
    active: {
      transform: 'translateY(0)',
      transition: transitions.transform.fast,
    },
  },
  
  // モーダル
  modal: {
    overlay: {
      enter: {
        keyframes: keyframes.fadeIn,
        duration: duration.normal,
        timing: easing.standard,
      },
      exit: {
        keyframes: keyframes.fadeOut,
        duration: duration.fast,
        timing: easing.standard,
      },
    },
    content: {
      enter: {
        keyframes: keyframes.slideInUp,
        duration: duration.slow,
        timing: easing.spring,
      },
      exit: {
        keyframes: keyframes.scaleOut,
        duration: duration.fast,
        timing: easing.standard,
      },
    },
  },
  
  // ドロップダウン
  dropdown: {
    enter: {
      keyframes: keyframes.scaleIn,
      duration: duration.fast,
      timing: easing.standard,
    },
    exit: {
      keyframes: keyframes.scaleOut,
      duration: duration.fastest,
      timing: easing.standard,
    },
  },
  
  // ツールチップ
  tooltip: {
    enter: {
      keyframes: keyframes.fadeIn,
      duration: duration.fast,
      timing: easing.standard,
    },
    exit: {
      keyframes: keyframes.fadeOut,
      duration: duration.fastest,
      timing: easing.standard,
    },
  },
  
  // トースト通知
  toast: {
    enter: {
      keyframes: keyframes.slideInRight,
      duration: duration.normal,
      timing: easing.spring,
    },
    exit: {
      keyframes: {
        from: { opacity: '1', transform: 'translateX(0)' },
        to: { opacity: '0', transform: 'translateX(100%)' },
      },
      duration: duration.normal,
      timing: easing.standard,
    },
  },
  
  // リップルエフェクト
  ripple: {
    keyframes: {
      to: {
        transform: 'scale(4)',
        opacity: '0',
      },
    },
    duration: '0.6s',
    timing: easing.easeOut,
  },
} as const

// モーションの設定（ユーザー設定対応）
export const motionConfig = {
  // アクセシビリティ: モーションを減らす設定
  reduced: {
    transition: 'none',
    animation: 'none',
    duration: '0ms',
  },
  
  // 通常のモーション設定
  normal: {
    transition: transitions.all.normal,
    duration: duration.normal,
  },
} as const

// 型定義
export type EasingKey = keyof typeof easing
export type DurationKey = keyof typeof duration
export type TransitionType = keyof typeof transitions
export type KeyframeType = keyof typeof keyframes
export type CalendarAnimationType = keyof typeof calendarAnimations
export type ComponentAnimationType = keyof typeof componentAnimations