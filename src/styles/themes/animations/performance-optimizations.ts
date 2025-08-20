/**
 * アニメーションパフォーマンス最適化システム - BoxLog統一仕様
 * 60fps維持、GPUアクセラレーション、レイアウトシフト最小化
 */

// ===== GPUアクセラレーション =====

export const gpuAcceleration = {
  // 基本的なGPU最適化
  enable: 'transform-gpu will-change-transform',
  enableOpacity: 'transform-gpu will-change-opacity',
  enableTransform: 'transform-gpu will-change-transform',
  enableAuto: 'will-change-auto',
  
  // 複合最適化
  composite: {
    // 変形とOpacityの両方を最適化
    transformOpacity: 'transform-gpu will-change-transform will-change-opacity',
    // スクロール最適化
    scroll: 'will-change-scroll',
    // コンテンツ変更最適化
    contents: 'will-change-contents',
  },
  
  // 3D変形でのGPU強制使用
  force3d: 'translate-z-0',
  
  // レイヤー分離
  createLayer: 'translate-z-0 backface-hidden',
  
  // アンチエイリアス
  antialiased: 'antialiased',
  subpixelAntialiased: 'subpixel-antialiased',
} as const

// ===== パフォーマンス最適化クラス =====

export const performanceClasses = {
  // 高パフォーマンスボタン
  button: {
    base: 'transform-gpu will-change-transform antialiased',
    interactive: 'transform-gpu will-change-transform will-change-opacity antialiased',
    ripple: 'transform-gpu will-change-transform overflow-hidden backface-hidden',
  },
  
  // 高パフォーマンスカード
  card: {
    base: 'transform-gpu will-change-transform antialiased',
    hover: 'transform-gpu will-change-transform will-change-opacity backface-hidden',
    drag: 'transform-gpu will-change-transform will-change-opacity translate-z-0',
  },
  
  // 高パフォーマンスモーダル
  modal: {
    overlay: 'will-change-opacity transform-gpu',
    content: 'transform-gpu will-change-transform will-change-opacity backface-hidden',
    backdrop: 'backdrop-blur-sm will-change-auto',
  },
  
  // 高パフォーマンススクロール
  scroll: {
    container: 'will-change-scroll transform-gpu',
    item: 'transform-gpu backface-hidden',
    virtualizer: 'will-change-transform will-change-scroll transform-gpu',
  },
  
  // 高パフォーマンスリスト
  list: {
    container: 'will-change-contents transform-gpu',
    item: 'transform-gpu will-change-transform backface-hidden',
    virtualItem: 'transform-gpu will-change-transform will-change-opacity',
  },
} as const

// ===== レイアウトシフト防止 =====

export const layoutShiftPrevention = {
  // アスペクト比固定
  aspectRatio: {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    card: 'aspect-[4/5]',
  },
  
  // 最小高さ固定
  minHeight: {
    button: 'min-h-10',
    card: 'min-h-24',
    input: 'min-h-10',
    avatar: 'min-h-10 min-w-10',
  },
  
  // コンテンツプレースホルダー
  placeholder: {
    text: 'min-h-4 block',
    image: 'min-h-48 bg-muted/20',
    button: 'min-h-10 min-w-20',
  },
  
  // グリッド固定
  grid: {
    fixed: 'grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
    responsive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    aspectFixed: 'grid aspect-square',
  },
} as const

// ===== 60fps最適化 =====

export const fpsOptimization = {
  // 軽量トランジション（60fps維持）
  lightweight: {
    opacity: 'transition-opacity duration-200 ease-out',
    transform: 'transition-transform duration-200 ease-out transform-gpu',
    scale: 'transition-transform duration-200 ease-out transform-gpu',
    color: 'transition-colors duration-200 ease-out',
  },
  
  // 重量トランジション（30fps許容）
  heavyweight: {
    blur: 'transition-all duration-300 ease-out',
    filter: 'transition-all duration-400 ease-out',
    shadow: 'transition-shadow duration-300 ease-out',
  },
  
  // フレームレート制御
  frameRate: {
    // 60fps推奨
    fast: 'duration-100 ease-linear',
    normal: 'duration-200 ease-out',
    // 30fps許容
    slow: 'duration-400 ease-in-out',
    // 可変フレームレート
    adaptive: 'duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
  },
} as const

// ===== リソース効率化 =====

export const resourceEfficiency = {
  // メモリ効率化
  memory: {
    // 不要なレイヤー削除
    flatten: 'will-change-auto',
    // メモリ使用量削減
    lowMemory: 'transform-cpu will-change-auto',
    // キャッシュ最適化
    cache: 'will-change-transform translate-z-0',
  },
  
  // CPU効率化
  cpu: {
    // CPU使用を強制（軽量デバイス用）
    force: 'transform-cpu',
    // ハイブリッド（状況に応じて自動選択）
    hybrid: 'transform-auto',
    // 最小CPU使用
    minimal: 'will-change-auto transform-cpu',
  },
  
  // バッテリー効率化
  battery: {
    // 省電力モード
    saver: 'will-change-auto transform-cpu motion-reduce:transition-none',
    // 適応的パフォーマンス
    adaptive: 'motion-safe:transform-gpu motion-reduce:transform-cpu',
    // 超省電力
    minimal: 'transition-none transform-cpu will-change-auto',
  },
} as const

// ===== デバイス適応最適化 =====

export const deviceOptimization = {
  // モバイル最適化
  mobile: {
    touch: 'touch-manipulation will-change-transform',
    scroll: 'overscroll-contain will-change-scroll',
    tap: 'select-none touch-manipulation',
  },
  
  // デスクトップ最適化
  desktop: {
    hover: 'hover:transform-gpu hover:will-change-transform',
    precision: 'subpixel-antialiased',
    smooth: 'scroll-smooth transform-gpu',
  },
  
  // 低スペックデバイス
  lowSpec: {
    minimal: 'transform-cpu will-change-auto motion-reduce:transition-none',
    essential: 'transition-opacity duration-200 transform-cpu',
    disabled: 'transition-none transform-none will-change-auto',
  },
  
  // 高スペックデバイス
  highSpec: {
    enhanced: 'transform-gpu will-change-transform backdrop-blur-sm',
    premium: 'transform-gpu will-change-transform will-change-opacity backdrop-blur-md',
    maximum: 'transform-gpu will-change-transform will-change-opacity will-change-filter',
  },
} as const

// ===== アニメーション品質レベル =====

export const qualityLevels = {
  // 最小品質（超軽量）
  minimal: {
    transition: 'transition-opacity duration-200',
    animation: 'animate-none',
    effects: 'shadow-none blur-none',
    gpu: 'transform-cpu will-change-auto',
  },
  
  // 標準品質（バランス重視）
  standard: {
    transition: 'transition-all duration-200 ease-out transform-gpu',
    animation: 'motion-safe:animate-pulse motion-reduce:animate-none',
    effects: 'shadow-sm',
    gpu: 'transform-gpu will-change-transform',
  },
  
  // 高品質（デスクトップ推奨）
  high: {
    transition: 'transition-all duration-300 ease-out transform-gpu',
    animation: 'animate-bounce motion-reduce:animate-pulse',
    effects: 'shadow-lg backdrop-blur-sm',
    gpu: 'transform-gpu will-change-transform will-change-opacity',
  },
  
  // 最高品質（高性能デバイス）
  premium: {
    transition: 'transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu',
    animation: 'animate-bounce motion-reduce:animate-pulse',
    effects: 'shadow-2xl backdrop-blur-md filter',
    gpu: 'transform-gpu will-change-transform will-change-opacity will-change-filter',
  },
} as const

// ===== パフォーマンス監視 =====

export const performanceMonitoring = {
  // パフォーマンス測定用属性
  markers: {
    animationStart: 'data-perf-animation-start',
    animationEnd: 'data-perf-animation-end',
    renderStart: 'data-perf-render-start',
    renderEnd: 'data-perf-render-end',
  },
  
  // デバッグ用クラス
  debug: {
    outline: 'outline outline-2 outline-red-500',
    background: 'bg-red-500/10',
    border: 'border-2 border-yellow-500',
  },
  
  // 測定用セレクター
  selectors: {
    animated: '[class*="animate-"]',
    transitioned: '[class*="transition-"]',
    gpu: '[class*="transform-gpu"]',
    willChange: '[class*="will-change-"]',
  },
} as const

// ===== 実行時パフォーマンス最適化 =====

export const runtimeOptimization = {
  // 動的最適化
  dynamic: {
    // フレームレート適応
    adaptiveFrameRate: `
      @supports (content-visibility: auto) {
        .adaptive-performance {
          content-visibility: auto;
          contain-intrinsic-size: 200px;
        }
      }
    `,
    
    // 遅延レンダリング
    lazyRender: 'content-visibility-auto contain-intrinsic-size-200',
    
    // ビューポート最適化
    viewport: 'contain-layout contain-style contain-paint',
  },
  
  // メモリ管理
  memory: {
    // ガベージコレクション最適化
    cleanup: 'will-change-auto',
    // メモリプール
    pool: 'transform-gpu backface-hidden',
    // リソース再利用
    reuse: 'contain-strict',
  },
} as const

// ===== ユーティリティ関数 =====

/**
 * デバイス性能に基づく最適化クラスを選択
 */
export const selectOptimizationLevel = (deviceCapability: 'low' | 'medium' | 'high' | 'premium' = 'medium') => {
  const levels = {
    low: qualityLevels.minimal,
    medium: qualityLevels.standard,
    high: qualityLevels.high,
    premium: qualityLevels.premium,
  }
  
  return levels[deviceCapability]
}

/**
 * ネットワーク状況に基づくアニメーション調整
 */
export const adaptToConnection = (connectionType: 'slow' | 'fast' | 'offline' = 'fast') => {
  const adaptations = {
    slow: deviceOptimization.lowSpec.minimal,
    fast: qualityLevels.high.transition,
    offline: qualityLevels.minimal.transition,
  }
  
  return adaptations[connectionType]
}

/**
 * バッテリー状況に基づく最適化
 */
export const adaptToBattery = (batteryLevel: 'low' | 'medium' | 'high' = 'medium') => {
  const adaptations = {
    low: resourceEfficiency.battery.saver,
    medium: resourceEfficiency.battery.adaptive,
    high: qualityLevels.premium.gpu,
  }
  
  return adaptations[batteryLevel]
}

/**
 * 複合最適化クラスを生成
 */
export const combineOptimizations = (...optimizations: string[]) => {
  return optimizations.filter(Boolean).join(' ')
}

/**
 * アニメーション安全性チェック
 */
export const safeAnimation = (animationClass: string, fallback: string = 'transition-opacity') => {
  return `motion-safe:${animationClass} motion-reduce:${fallback}`
}

/**
 * パフォーマンス測定ヘルパー
 */
export const measurePerformance = {
  start: (name: string) => `data-perf-start="${name}"`,
  end: (name: string) => `data-perf-end="${name}"`,
  mark: (name: string) => `data-perf-mark="${name}"`,
}