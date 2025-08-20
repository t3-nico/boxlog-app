/**
 * ページトランジションシステム - BoxLog統一仕様
 * ルート遷移、モーダル表示、タブ切り替えのアニメーション
 */

import { primitiveTransitions } from '../design-tokens'

// ===== ページ遷移エフェクト =====

export const pageTransitions = {
  // フェード遷移
  fade: {
    enter: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      duration: 300,
      easing: 'ease-out',
    },
    
    // CSS版
    css: {
      enter: 'animate-fade-in duration-300 ease-out',
      exit: 'animate-fade-out duration-300 ease-out',
    },
  },
  
  // スライド遷移
  slide: {
    right: {
      enter: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 },
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      css: {
        enter: 'animate-slide-in-right duration-400 ease-out',
        exit: 'animate-slide-out-left duration-400 ease-out',
      },
    },
    
    left: {
      enter: {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 },
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      css: {
        enter: 'animate-slide-in-left duration-400 ease-out',
        exit: 'animate-slide-out-right duration-400 ease-out',
      },
    },
    
    up: {
      enter: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 },
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      css: {
        enter: 'animate-slide-in-up duration-400 ease-out',
        exit: 'animate-slide-out-up duration-400 ease-out',
      },
    },
    
    down: {
      enter: {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      css: {
        enter: 'animate-slide-in-down duration-400 ease-out',
        exit: 'animate-slide-out-down duration-400 ease-out',
      },
    },
  },
  
  // スケール遷移
  scale: {
    enter: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      duration: 300,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    css: {
      enter: 'animate-scale-in duration-300 ease-spring',
      exit: 'animate-scale-out duration-300 ease-spring',
    },
  },
} as const

// ===== モーダル・ダイアログ遷移 =====

export const modalTransitions = {
  // オーバーレイ
  overlay: {
    enter: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      duration: 200,
      easing: 'ease-out',
    },
    css: {
      enter: 'animate-fade-in duration-200 ease-out',
      exit: 'animate-fade-out duration-200 ease-out',
    },
  },
  
  // モーダルコンテンツ
  content: {
    // センターからスケール
    scale: {
      enter: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        duration: 300,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      css: {
        enter: 'animate-modal-scale-in duration-300 ease-spring',
        exit: 'animate-modal-scale-out duration-300 ease-spring',
      },
    },
    
    // 下からスライドイン
    slideUp: {
      enter: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 },
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      css: {
        enter: 'animate-modal-slide-up duration-400 ease-out',
        exit: 'animate-modal-slide-down duration-400 ease-out',
      },
    },
    
    // 上からドロップダウン
    dropdown: {
      enter: {
        initial: { y: '-20px', opacity: 0, scale: 0.95 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: '-20px', opacity: 0, scale: 0.95 },
        duration: 200,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      css: {
        enter: 'animate-dropdown-in duration-200 ease-out',
        exit: 'animate-dropdown-out duration-200 ease-out',
      },
    },
  },
} as const

// ===== タブ切り替え遷移 =====

export const tabTransitions = {
  // 水平スライド
  horizontal: {
    enter: {
      initial: { x: '20px', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-20px', opacity: 0 },
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    css: {
      enter: 'animate-tab-slide-in duration-250 ease-out',
      exit: 'animate-tab-slide-out duration-250 ease-out',
    },
  },
  
  // フェード
  fade: {
    enter: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      duration: 200,
      easing: 'ease-out',
    },
    css: {
      enter: 'animate-tab-fade-in duration-200 ease-out',
      exit: 'animate-tab-fade-out duration-200 ease-out',
    },
  },
  
  // 垂直スライド
  vertical: {
    enter: {
      initial: { y: '10px', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '-10px', opacity: 0 },
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    css: {
      enter: 'animate-tab-slide-up duration-200 ease-out',
      exit: 'animate-tab-slide-down duration-200 ease-out',
    },
  },
} as const

// ===== アコーディオン・コラプス遷移 =====

export const accordionTransitions = {
  // 高さの展開・折りたたみ
  height: {
    expand: {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 },
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    css: {
      expand: 'animate-accordion-expand duration-300 ease-out overflow-hidden',
      collapse: 'animate-accordion-collapse duration-300 ease-out overflow-hidden',
    },
  },
  
  // スケールとフェード
  scaleY: {
    expand: {
      initial: { scaleY: 0, opacity: 0, transformOrigin: 'top' },
      animate: { scaleY: 1, opacity: 1 },
      exit: { scaleY: 0, opacity: 0 },
      duration: 250,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    css: {
      expand: 'animate-scale-y-expand duration-250 ease-out origin-top',
      collapse: 'animate-scale-y-collapse duration-250 ease-out origin-top',
    },
  },
} as const

// ===== トースト・通知遷移 =====

export const toastTransitions = {
  // 右からスライドイン
  slideRight: {
    enter: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 },
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    css: {
      enter: 'animate-toast-slide-in duration-300 ease-out',
      exit: 'animate-toast-slide-out duration-300 ease-out',
    },
  },
  
  // 上からドロップダウン
  dropdown: {
    enter: {
      initial: { y: '-100%', opacity: 0, scale: 0.9 },
      animate: { y: 0, opacity: 1, scale: 1 },
      exit: { y: '-100%', opacity: 0, scale: 0.9 },
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    css: {
      enter: 'animate-toast-dropdown duration-400 ease-spring',
      exit: 'animate-toast-slide-up duration-300 ease-out',
    },
  },
  
  // バウンス入場
  bounce: {
    enter: {
      initial: { y: '-10px', opacity: 0, scale: 0.9 },
      animate: { y: 0, opacity: 1, scale: 1 },
      exit: { y: '-10px', opacity: 0, scale: 0.9 },
      duration: 500,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    css: {
      enter: 'animate-toast-bounce duration-500 ease-bounce',
      exit: 'animate-toast-fade-out duration-200 ease-out',
    },
  },
} as const

// ===== カスタムキーフレーム（CSS用） =====

export const transitionKeyframes = {
  // ページ遷移
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'fade-out': {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  
  // スライド遷移
  'slide-in-right': {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'slide-out-left': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(-100%)', opacity: '0' },
  },
  'slide-in-left': {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'slide-out-right': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(100%)', opacity: '0' },
  },
  'slide-in-up': {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'slide-out-up': {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(-100%)', opacity: '0' },
  },
  'slide-in-down': {
    '0%': { transform: 'translateY(-100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'slide-out-down': {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(100%)', opacity: '0' },
  },
  
  // スケール遷移
  'scale-in': {
    '0%': { transform: 'scale(0.9)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  'scale-out': {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(0.9)', opacity: '0' },
  },
  
  // モーダル専用
  'modal-scale-in': {
    '0%': { transform: 'scale(0.9)', opacity: '0' },
    '50%': { transform: 'scale(1.02)', opacity: '0.8' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  'modal-scale-out': {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(0.9)', opacity: '0' },
  },
  'modal-slide-up': {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'modal-slide-down': {
    '0%': { transform: 'translateY(0)', opacity: '1' },
    '100%': { transform: 'translateY(100%)', opacity: '0' },
  },
  
  // ドロップダウン
  'dropdown-in': {
    '0%': { transform: 'translateY(-20px) scale(0.95)', opacity: '0' },
    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
  },
  'dropdown-out': {
    '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
    '100%': { transform: 'translateY(-20px) scale(0.95)', opacity: '0' },
  },
  
  // アコーディオン
  'accordion-expand': {
    '0%': { height: '0', opacity: '0' },
    '100%': { height: 'auto', opacity: '1' },
  },
  'accordion-collapse': {
    '0%': { height: 'auto', opacity: '1' },
    '100%': { height: '0', opacity: '0' },
  },
  'scale-y-expand': {
    '0%': { transform: 'scaleY(0)', opacity: '0' },
    '100%': { transform: 'scaleY(1)', opacity: '1' },
  },
  'scale-y-collapse': {
    '0%': { transform: 'scaleY(1)', opacity: '1' },
    '100%': { transform: 'scaleY(0)', opacity: '0' },
  },
  
  // トースト
  'toast-slide-in': {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },
  'toast-slide-out': {
    '0%': { transform: 'translateX(0)', opacity: '1' },
    '100%': { transform: 'translateX(100%)', opacity: '0' },
  },
  'toast-dropdown': {
    '0%': { transform: 'translateY(-100%) scale(0.9)', opacity: '0' },
    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
  },
  'toast-bounce': {
    '0%': { transform: 'translateY(-10px) scale(0.9)', opacity: '0' },
    '50%': { transform: 'translateY(-5px) scale(1.05)', opacity: '0.8' },
    '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
  },
} as const

// ===== ユーティリティ関数 =====

/**
 * 遷移方向を取得
 */
export const getTransitionDirection = (fromPath: string, toPath: string): 'forward' | 'backward' | 'none' => {
  // パスの階層レベルを比較
  const fromLevel = fromPath.split('/').length
  const toLevel = toPath.split('/').length
  
  if (fromLevel < toLevel) return 'forward'
  if (fromLevel > toLevel) return 'backward'
  return 'none'
}

/**
 * レスポンシブ遷移クラス
 */
export const responsiveTransition = {
  mobile: (transition: string) => `sm:${transition}`,
  desktop: (transition: string) => `lg:${transition}`,
  reduced: (transition: string, fallback: string = 'transition-none') => 
    `motion-safe:${transition} motion-reduce:${fallback}`,
}

/**
 * 遷移の組み合わせ
 */
export const combineTransitions = {
  modalWithOverlay: {
    overlay: modalTransitions.overlay.css.enter,
    content: modalTransitions.content.scale.css.enter,
  },
  tabWithContent: {
    tab: tabTransitions.horizontal.css.enter,
    content: tabTransitions.fade.css.enter,
  },
}