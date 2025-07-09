'use client'

import React, { ReactNode } from 'react'

interface ViewTransitionProps {
  children: ReactNode
  viewType: string
  className?: string
}

export function ViewTransition({ children, viewType, className = '' }: ViewTransitionProps) {
  return (
    <div
      key={viewType}
      className={`h-full transition-all duration-200 ease-in-out ${className}`}
      style={{
        animation: 'fadeInSlide 0.2s ease-in-out'
      }}
    >
      {children}
      
      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

// タスクドラッグ時のアニメーション
interface TaskDragAnimationProps {
  isDragging: boolean
  children: ReactNode
}

export function TaskDragAnimation({ isDragging, children }: TaskDragAnimationProps) {
  return (
    <div
      className={`transition-all duration-150 ${
        isDragging ? 'scale-105 shadow-lg opacity-80' : 'scale-100 shadow-sm opacity-100'
      }`}
    >
      {children}
    </div>
  )
}

// スムーズなホバーエフェクト
interface HoverEffectProps {
  children: ReactNode
  isHovered: boolean
  disabled?: boolean
}

export function HoverEffect({ children, isHovered, disabled = false }: HoverEffectProps) {
  if (disabled) return <>{children}</>
  
  return (
    <div
      className={`transition-all duration-150 ${
        isHovered 
          ? 'scale-102 shadow-md brightness-110' 
          : 'scale-100 shadow-sm brightness-100'
      }`}
    >
      {children}
    </div>
  )
}

// フェードイン/アウトアニメーション
interface FadeTransitionProps {
  show: boolean
  children: ReactNode
  duration?: number
  className?: string
}

export function FadeTransition({ 
  show, 
  children, 
  duration = 200,
  className = '' 
}: FadeTransitionProps) {
  return (
    <div
      className={`transition-opacity duration-${duration} ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// スライドアニメーション
interface SlideTransitionProps {
  show: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
  children: ReactNode
  duration?: number
  className?: string
}

export function SlideTransition({
  show,
  direction = 'up',
  children,
  duration = 200,
  className = ''
}: SlideTransitionProps) {
  const getTransform = () => {
    if (show) return 'translate-0'
    
    switch (direction) {
      case 'up': return 'translate-y-2'
      case 'down': return '-translate-y-2'
      case 'left': return 'translate-x-2'
      case 'right': return '-translate-x-2'
      default: return 'translate-y-2'
    }
  }
  
  return (
    <div
      className={`transition-all duration-${duration} ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${getTransform()} ${className}`}
    >
      {children}
    </div>
  )
}

// タスク作成時のアニメーション
interface TaskCreateAnimationProps {
  children: ReactNode
  isNew?: boolean
}

export function TaskCreateAnimation({ children, isNew = false }: TaskCreateAnimationProps) {
  return (
    <div
      className={`${
        isNew 
          ? 'animate-pulse shadow-lg ring-2 ring-blue-400 ring-opacity-50' 
          : ''
      } transition-all duration-300`}
    >
      {children}
    </div>
  )
}

// カレンダービュー切り替え時のアニメーション
interface CalendarViewAnimationProps {
  children: ReactNode
  viewType: 'day' | '3day' | 'week' | 'week-no-weekend' | '2week' | 'schedule' | 'month'
  previousViewType?: 'day' | '3day' | 'week' | 'week-no-weekend' | '2week' | 'schedule' | 'month'
}

export function CalendarViewAnimation({ 
  children, 
  viewType, 
  previousViewType 
}: CalendarViewAnimationProps) {
  const getAnimationClass = () => {
    if (!previousViewType) return ''
    
    // ズーム系の切り替え
    if (
      (previousViewType === 'month' && viewType === 'week') ||
      (previousViewType === 'week' && viewType === 'day')
    ) {
      return 'animate-zoomIn'
    }
    
    if (
      (previousViewType === 'day' && viewType === 'week') ||
      (previousViewType === 'week' && viewType === 'month')
    ) {
      return 'animate-zoomOut'
    }
    
    return 'animate-slideIn'
  }
  
  return (
    <div className={`${getAnimationClass()} h-full`}>
      {children}
      
      <style jsx>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes zoomOut {
          from {
            opacity: 0;
            transform: scale(1.05);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out;
        }
        
        .animate-zoomOut {
          animation: zoomOut 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

// 読み込み時のスケルトンアニメーション
interface SkeletonAnimationProps {
  show: boolean
  count?: number
  height?: string
  className?: string
}

export function SkeletonAnimation({ 
  show, 
  count = 3, 
  height = 'h-8',
  className = '' 
}: SkeletonAnimationProps) {
  if (!show) return null
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

// タスクホバー時の詳細表示アニメーション
interface TaskHoverTooltipProps {
  show: boolean
  children: ReactNode
  position?: { x: number; y: number }
}

export function TaskHoverTooltip({ show, children, position }: TaskHoverTooltipProps) {
  if (!show) return null
  
  return (
    <div
      className="fixed z-50 pointer-events-none transition-all duration-150"
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
        {children}
      </div>
    </div>
  )
}

// パフォーマンス最適化：アニメーションの有効/無効を制御
interface AnimationWrapperProps {
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function AnimationWrapper({ children, disabled = false, className = '' }: AnimationWrapperProps) {
  return (
    <div className={`${disabled ? '' : 'transition-all duration-150'} ${className}`}>
      {children}
    </div>
  )
}

// アニメーション設定のコンテキスト
import { createContext, useContext } from 'react'

interface AnimationContextType {
  enabled: boolean
  reducedMotion: boolean
  duration: 'fast' | 'normal' | 'slow'
}

const AnimationContext = createContext<AnimationContextType>({
  enabled: true,
  reducedMotion: false,
  duration: 'normal'
})

export function useAnimation() {
  return useContext(AnimationContext)
}

interface AnimationProviderProps {
  children: ReactNode
  config?: Partial<AnimationContextType>
}

export function AnimationProvider({ children, config = {} }: AnimationProviderProps) {
  const defaultConfig: AnimationContextType = {
    enabled: true,
    reducedMotion: false,
    duration: 'normal',
    ...config
  }
  
  return (
    <AnimationContext.Provider value={defaultConfig}>
      {children}
    </AnimationContext.Provider>
  )
}