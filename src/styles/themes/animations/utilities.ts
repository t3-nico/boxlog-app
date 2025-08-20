/**
 * アニメーションユーティリティ関数 - BoxLog統一仕様
 * 統一されたアニメーション制御とヘルパー関数
 */

import { microInteractions, hoverEffects, clickEffects, focusEffects } from './micro-interactions'
import { pageTransitions, modalTransitions, tabTransitions } from './page-transitions'
import { skeletonPatterns, skeletonComponents } from './skeleton-loading'
import { performanceClasses, qualityLevels } from './performance-optimizations'
import { motionReduction, wcagCompliant, progressiveAnimation } from './accessibility'

// ===== 中央集約的アニメーション制御 =====

export class AnimationController {
  private static instance: AnimationController
  private performanceLevel: keyof typeof qualityLevels = 'standard'
  private accessibilityMode: 'none' | 'reduced' | 'full' = 'full'
  private deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  
  static getInstance(): AnimationController {
    if (!AnimationController.instance) {
      AnimationController.instance = new AnimationController()
    }
    return AnimationController.instance
  }
  
  /**
   * パフォーマンスレベルを設定
   */
  setPerformanceLevel(level: keyof typeof qualityLevels) {
    this.performanceLevel = level
  }
  
  /**
   * アクセシビリティモードを設定
   */
  setAccessibilityMode(mode: 'none' | 'reduced' | 'full') {
    this.accessibilityMode = mode
  }
  
  /**
   * デバイスタイプを設定
   */
  setDeviceType(type: 'mobile' | 'tablet' | 'desktop') {
    this.deviceType = type
  }
  
  /**
   * 適応的アニメーションクラスを取得
   */
  getAdaptiveClass(baseAnimation: string): string {
    const quality = qualityLevels[this.performanceLevel]
    const accessibility = this.getAccessibilityClass(baseAnimation)
    
    return `${quality.transition} ${accessibility}`
  }
  
  /**
   * アクセシビリティ対応クラスを取得
   */
  private getAccessibilityClass(animation: string): string {
    switch (this.accessibilityMode) {
      case 'none':
        return motionReduction.disable.all
      case 'reduced':
        return motionReduction.safe.minimal
      case 'full':
      default:
        return `motion-safe:${animation} motion-reduce:${motionReduction.safe.minimal}`
    }
  }
}

// ===== 汎用アニメーションヘルパー =====

export const animationHelpers = {
  /**
   * 遅延付きアニメーション
   */
  withDelay: (animation: string, delay: number) => 
    `${animation} [animation-delay:${delay}ms]`,
  
  /**
   * 条件付きアニメーション
   */
  conditional: (condition: boolean, animation: string, fallback: string = '') =>
    condition ? animation : fallback,
  
  /**
   * レスポンシブアニメーション
   */
  responsive: {
    mobile: (animation: string) => `sm:${animation}`,
    tablet: (animation: string) => `md:${animation}`,
    desktop: (animation: string) => `lg:${animation}`,
  },
  
  /**
   * 状態依存アニメーション
   */
  stateful: {
    hover: (animation: string) => `hover:${animation}`,
    focus: (animation: string) => `focus:${animation}`,
    active: (animation: string) => `active:${animation}`,
    loading: (animation: string) => `data-loading:${animation}`,
    error: (animation: string) => `data-error:${animation}`,
  },
  
  /**
   * 組み合わせアニメーション
   */
  combine: (...animations: string[]) => animations.filter(Boolean).join(' '),
  
  /**
   * チェーンアニメーション
   */
  chain: (animations: Array<{ animation: string; delay: number }>) =>
    animations.map(({ animation, delay }) => 
      animationHelpers.withDelay(animation, delay)
    ).join(' '),
} as const

// ===== プリセットアニメーション =====

export const presetAnimations = {
  // ボタンアニメーション
  button: {
    primary: animationHelpers.combine(
      hoverEffects.scale.normal,
      clickEffects.press.normal,
      focusEffects.ring.default,
      performanceClasses.button.interactive
    ),
    
    secondary: animationHelpers.combine(
      hoverEffects.lift.subtle,
      clickEffects.press.subtle,
      focusEffects.ring.subtle,
      performanceClasses.button.base
    ),
    
    ghost: animationHelpers.combine(
      hoverEffects.color.subtle,
      clickEffects.press.subtle,
      focusEffects.background.subtle
    ),
    
    icon: animationHelpers.combine(
      hoverEffects.scale.subtle,
      hoverEffects.color.primary,
      clickEffects.press.subtle,
      focusEffects.ring.subtle
    ),
  },
  
  // カードアニメーション
  card: {
    interactive: animationHelpers.combine(
      hoverEffects.lift.normal,
      clickEffects.press.subtle,
      focusEffects.ring.subtle,
      performanceClasses.card.hover
    ),
    
    static: animationHelpers.combine(
      hoverEffects.lift.subtle,
      performanceClasses.card.base
    ),
    
    draggable: animationHelpers.combine(
      hoverEffects.lift.pronounced,
      performanceClasses.card.drag
    ),
  },
  
  // モーダルアニメーション
  modal: {
    overlay: modalTransitions.overlay.css.enter,
    content: modalTransitions.content.scale.css.enter,
    slideUp: modalTransitions.content.slideUp.css.enter,
    dropdown: modalTransitions.content.dropdown.css.enter,
  },
  
  // ページ遷移アニメーション
  page: {
    fade: pageTransitions.fade.css.enter,
    slideRight: pageTransitions.slide.right.css.enter,
    slideLeft: pageTransitions.slide.left.css.enter,
    scale: pageTransitions.scale.css.enter,
  },
  
  // リストアニメーション
  list: {
    item: 'animate-fade-in-up duration-300 ease-out',
    staggered: (index: number) => 
      animationHelpers.withDelay('animate-fade-in-up duration-300 ease-out', index * 100),
  },
} as const

// ===== スケルトンローディングヘルパー =====

export const skeletonHelpers = {
  /**
   * テキストスケルトンを生成
   */
  text: (lines: number = 3, widths: string[] = ['w-full', 'w-3/4', 'w-1/2']) =>
    Array.from({ length: lines }, (_, i) => 
      `${skeletonComponents.text.line} ${widths[i] || 'w-full'}`
    ),
  
  /**
   * カードスケルトンを生成
   */
  card: (includeAvatar: boolean = false, includeImage: boolean = false) => {
    const parts = []
    
    if (includeAvatar) parts.push(skeletonComponents.avatar.md)
    if (includeImage) parts.push(skeletonComponents.image.landscape)
    parts.push(...skeletonHelpers.text(3))
    
    return parts
  },
  
  /**
   * テーブルスケルトンを生成
   */
  table: (rows: number = 5, columns: number = 4) =>
    Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => skeletonComponents.text.line)
    ),
  
  /**
   * カスタムスケルトンパターン
   */
  custom: (pattern: keyof typeof skeletonPatterns = 'shimmer') =>
    skeletonPatterns[pattern].base,
} as const

// ===== 動的アニメーション制御 =====

export const dynamicAnimation = {
  /**
   * 要素の可視性に基づくアニメーション
   */
  onVisible: (element: HTMLElement, animation: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(...animation.split(' '))
        }
      })
    })
    
    observer.observe(element)
    return () => observer.disconnect()
  },
  
  /**
   * スクロール位置に基づくアニメーション
   */
  onScroll: (element: HTMLElement, animations: Record<string, string>) => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const elementTop = element.offsetTop
      const elementHeight = element.offsetHeight
      
      const progress = Math.max(0, Math.min(1, 
        (scrollY - elementTop) / elementHeight
      ))
      
      Object.entries(animations).forEach(([threshold, animation]) => {
        if (progress >= parseFloat(threshold)) {
          element.classList.add(...animation.split(' '))
        }
      })
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  },
  
  /**
   * マウス位置に基づくアニメーション
   */
  onMouse: (element: HTMLElement, animation: string) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      
      element.style.transform = `perspective(1000px) rotateX(${y * 5}deg) rotateY(${x * 5}deg)`
    }
    
    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    }
    
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  },
} as const

// ===== パフォーマンス監視 =====

export const performanceMonitor = {
  /**
   * アニメーションパフォーマンスを測定
   */
  measureAnimation: (element: HTMLElement, animationName: string) => {
    const startTime = performance.now()
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const endTime = performance.now()
          console.log(`Animation ${animationName} took ${endTime - startTime} milliseconds`)
        }
      })
    })
    
    observer.observe(element, { attributes: true })
    
    return () => observer.disconnect()
  },
  
  /**
   * フレームレートを監視
   */
  monitorFrameRate: (callback: (fps: number) => void) => {
    let lastTime = performance.now()
    let frameCount = 0
    
    const measure = () => {
      const currentTime = performance.now()
      frameCount++
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        callback(fps)
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measure)
    }
    
    requestAnimationFrame(measure)
  },
  
  /**
   * レイアウトシフトを検出
   */
  detectLayoutShift: (element: HTMLElement, callback: (shift: number) => void) => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { blockSize, inlineSize } = entry.borderBoxSize[0]
        const shift = Math.abs(blockSize - element.offsetHeight) + 
                     Math.abs(inlineSize - element.offsetWidth)
        callback(shift)
      })
    })
    
    observer.observe(element)
    return () => observer.disconnect()
  },
} as const

// ===== エクスポート用統合オブジェクト =====

export const animations = {
  controller: AnimationController.getInstance(),
  helpers: animationHelpers,
  presets: presetAnimations,
  skeleton: skeletonHelpers,
  dynamic: dynamicAnimation,
  performance: performanceMonitor,
  
  // 便利なショートカット
  button: presetAnimations.button,
  card: presetAnimations.card,
  modal: presetAnimations.modal,
  page: presetAnimations.page,
} as const

// デフォルトエクスポート
export default animations