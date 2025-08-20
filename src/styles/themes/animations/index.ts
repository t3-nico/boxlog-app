/**
 * アニメーションシステム統合エクスポート - BoxLog統一仕様
 * 全てのアニメーション関連モジュールの統一インターフェース
 */

// ===== 基本アニメーションシステム =====
export * from './micro-interactions'
export * from './page-transitions'
export * from './skeleton-loading'
export * from './performance-optimizations'
export * from './accessibility'
export * from './utilities'

// ===== 統合アニメーションオブジェクト =====
import { 
  hoverEffects, 
  clickEffects, 
  focusEffects, 
  stateTransitions, 
  compositeInteractions,
  microKeyframes,
  withReducedMotion,
  combineEffects,
  performanceOptimizations,
} from './micro-interactions'

import {
  pageTransitions,
  modalTransitions,
  tabTransitions,
  accordionTransitions,
  toastTransitions,
  transitionKeyframes,
  getTransitionDirection,
  responsiveTransition,
} from './page-transitions'

import {
  skeletonPatterns,
  skeletonComponents,
  skeletonLayouts,
  calendarSkeletons,
  errorAnimations,
  loadingIndicators,
  skeletonKeyframes,
  generateSkeletonClass,
  staggeredLoading,
} from './skeleton-loading'

import {
  gpuAcceleration,
  performanceClasses,
  layoutShiftPrevention,
  fpsOptimization,
  qualityLevels,
  selectOptimizationLevel,
  combineOptimizations,
  safeAnimation,
} from './performance-optimizations'

import {
  motionReduction,
  wcagCompliant,
  progressiveAnimation,
  inclusivePatterns,
  createAccessibleAnimation,
  ensureWcagCompliance,
  a11yAttributes,
} from './accessibility'

import {
  animationHelpers,
  presetAnimations,
  skeletonHelpers,
  dynamicAnimation,
  performanceMonitor,
  animations as animationUtilities,
} from './utilities'

// ===== 統合アニメーションシステム =====

export const unifiedAnimations = {
  // マイクロインタラクション
  micro: {
    hover: hoverEffects,
    click: clickEffects,
    focus: focusEffects,
    state: stateTransitions,
    composite: compositeInteractions,
    keyframes: microKeyframes,
    utils: {
      withReducedMotion,
      combineEffects,
    },
  },
  
  // ページ・コンポーネント遷移
  transitions: {
    page: pageTransitions,
    modal: modalTransitions,
    tab: tabTransitions,
    accordion: accordionTransitions,
    toast: toastTransitions,
    keyframes: transitionKeyframes,
    utils: {
      getTransitionDirection,
      responsiveTransition,
    },
  },
  
  // ローディング・スケルトン
  loading: {
    patterns: skeletonPatterns,
    components: skeletonComponents,
    layouts: skeletonLayouts,
    calendar: calendarSkeletons,
    error: errorAnimations,
    indicators: loadingIndicators,
    keyframes: skeletonKeyframes,
    utils: {
      generateSkeletonClass,
      staggeredLoading,
    },
  },
  
  // パフォーマンス最適化
  performance: {
    gpu: gpuAcceleration,
    classes: performanceClasses,
    layoutShift: layoutShiftPrevention,
    fps: fpsOptimization,
    quality: qualityLevels,
    utils: {
      selectOptimizationLevel,
      combineOptimizations,
      safeAnimation,
    },
  },
  
  // アクセシビリティ
  a11y: {
    motionReduction,
    wcag: wcagCompliant,
    progressive: progressiveAnimation,
    inclusive: inclusivePatterns,
    attributes: a11yAttributes,
    utils: {
      createAccessibleAnimation,
      ensureWcagCompliance,
    },
  },
  
  // ユーティリティとヘルパー
  utils: {
    helpers: animationHelpers,
    presets: presetAnimations,
    skeleton: skeletonHelpers,
    dynamic: dynamicAnimation,
    monitor: performanceMonitor,
  },
} as const

// ===== Tailwind CSS統合用キーフレーム =====

export const allKeyframes = {
  // マイクロインタラクション
  ...microKeyframes,
  
  // ページ遷移
  ...transitionKeyframes,
  
  // スケルトンローディング
  ...skeletonKeyframes,
} as const

// ===== 完全なアニメーション設定 =====

export const animationConfig = {
  // キーフレーム定義
  keyframes: allKeyframes,
  
  // アニメーション設定
  animation: {
    // マイクロインタラクション
    'micro-ripple': 'ripple 0.3s ease-out',
    'micro-shake': 'shake 0.5s ease-in-out',
    'micro-heartbeat': 'heartbeat 1s ease-in-out infinite',
    'micro-fade-in-up': 'fadeInUp 0.3s ease-out',
    'micro-rotate-in': 'rotateIn 0.5s ease-out',
    
    // ページ遷移
    'page-fade-in': 'fade-in 0.3s ease-out',
    'page-fade-out': 'fade-out 0.3s ease-out',
    'page-slide-in-right': 'slide-in-right 0.4s ease-out',
    'page-slide-out-left': 'slide-out-left 0.4s ease-out',
    'page-scale-in': 'scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    
    // モーダル
    'modal-scale-in': 'modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    'modal-slide-up': 'modal-slide-up 0.4s ease-out',
    'dropdown-in': 'dropdown-in 0.2s ease-out',
    
    // スケルトン
    'skeleton-wave': 'skeleton-wave 2s ease-in-out infinite',
    'skeleton-wave-fast': 'skeleton-wave-fast 1s ease-in-out infinite',
    'skeleton-fade': 'skeleton-fade 1.5s ease-in-out infinite',
    
    // エラー・ローディング
    'shake-x': 'shake-x 0.5s ease-in-out',
    'fade-in-error': 'fade-in-error 0.3s ease-out',
    'pulse-error': 'pulse-error 1s ease-in-out infinite',
    'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
  },
  
  // パフォーマンス最適化クラス
  performanceOptimizations,
  
  // アクセシビリティ設定
  accessibility: {
    respectMotionPreferences: true,
    defaultReducedMotion: motionReduction.safe.minimal,
    wcagCompliance: true,
  },
} as const

// ===== ユーティリティ関数のエクスポート =====

export {
  // マイクロインタラクション
  withReducedMotion,
  combineEffects,
  
  // ページ遷移
  getTransitionDirection,
  responsiveTransition,
  
  // スケルトン
  generateSkeletonClass,
  staggeredLoading,
  
  // パフォーマンス
  selectOptimizationLevel,
  combineOptimizations,
  safeAnimation,
  
  // アクセシビリティ
  createAccessibleAnimation,
  ensureWcagCompliance,
  
  // 統合ユーティリティ
  animationUtilities as animations,
}

// ===== デフォルトエクスポート =====

export default unifiedAnimations

// ===== 型定義エクスポート =====

export type AnimationPreset = keyof typeof presetAnimations.button | 
                             keyof typeof presetAnimations.card |
                             keyof typeof presetAnimations.modal |
                             keyof typeof presetAnimations.page

export type QualityLevel = keyof typeof qualityLevels

export type AccessibilityMode = 'none' | 'reduced' | 'full'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export type PerformanceLevel = 'minimal' | 'standard' | 'high' | 'premium'