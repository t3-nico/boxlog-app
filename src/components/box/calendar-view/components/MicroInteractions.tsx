'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { 
  CheckIcon as CheckIconSolid,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid'

// リップルエフェクト
interface RippleEffect {
  id: string
  x: number
  y: number
  color?: string
}

interface TimeSlotRippleProps {
  onRipple?: (x: number, y: number) => void
  children: React.ReactNode
  className?: string
  rippleColor?: string
}

export function TimeSlotRipple({ 
  onRipple, 
  children, 
  className,
  rippleColor = "rgba(59, 130, 246, 0.3)"
}: TimeSlotRippleProps) {
  const [ripples, setRipples] = useState<RippleEffect[]>()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const createRipple = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newRipple: RippleEffect = {
      id: Date.now().toString(),
      x,
      y,
      color: rippleColor
    }
    
    setRipples(prev => [...(prev || []), newRipple])
    onRipple?.(x, y)
    
    // 600ms後にリップルを削除
    setTimeout(() => {
      setRipples(prev => prev?.filter(r => r.id !== newRipple.id) || [])
    }, 600)
  }, [onRipple, rippleColor])
  
  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onClick={createRipple}
    >
      {children}
      
      {/* リップルエフェクト */}
      <AnimatePresence>
        {ripples?.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none cal-ripple"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${ripple.color} 0%, transparent 70%)`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// タスク作成成功アニメーション
interface TaskCreatedAnimationProps {
  isVisible: boolean
  onComplete?: () => void
  message?: string
}

export function TaskCreatedAnimation({ 
  isVisible, 
  onComplete,
  message = "タスクを作成しました！"
}: TaskCreatedAnimationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          {/* チェックマークアニメーション */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 15,
              delay: 0.1
            }}
          >
            <CheckIconSolid className="w-5 h-5" />
          </motion.div>
          
          <span className="font-medium">{message}</span>
          
          {/* キラキラエフェクト */}
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <SparklesIconSolid className="w-4 h-4" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ホバーで表示される浮遊ツールチップ
interface FloatingTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function FloatingTooltip({ 
  children, 
  content, 
  placement = 'top',
  delay = 500
}: FloatingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }
  
  const getPlacementStyles = () => {
    switch (placement) {
      case 'top':
        return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }
      case 'bottom':
        return { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }
      case 'left':
        return { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }
      case 'right':
        return { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
    }
  }
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none"
            style={getPlacementStyles()}
          >
            {content}
            
            {/* 矢印 */}
            <div 
              className={cn(
                "absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45",
                placement === 'top' && "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
                placement === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
                placement === 'left' && "left-full top-1/2 -translate-y-1/2 -translate-x-1/2",
                placement === 'right' && "right-full top-1/2 -translate-y-1/2 translate-x-1/2"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// パフォーマンスインジケーター
interface PerformanceBadgeProps {
  score: number // 0-100
  type: 'focus' | 'energy' | 'satisfaction'
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PerformanceBadge({ 
  score, 
  type, 
  animated = true,
  size = 'md'
}: PerformanceBadgeProps) {
  const getConfig = () => {
    switch (type) {
      case 'focus':
        return { icon: '🎯', color: 'text-blue-600', bg: 'bg-blue-100', label: '集中度' }
      case 'energy':
        return { icon: '⚡', color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'エネルギー' }
      case 'satisfaction':
        return { icon: '😊', color: 'text-green-600', bg: 'bg-green-100', label: '満足度' }
    }
  }
  
  const config = getConfig()
  const sizeConfig = {
    sm: { text: 'text-xs', padding: 'px-2 py-1', icon: 'text-sm' },
    md: { text: 'text-sm', padding: 'px-3 py-1.5', icon: 'text-base' },
    lg: { text: 'text-base', padding: 'px-4 py-2', icon: 'text-lg' }
  }[size]
  
  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium",
        config.bg,
        config.color,
        sizeConfig.padding
      )}
      initial={animated ? { scale: 0, rotate: -180 } : undefined}
      animate={animated ? { scale: 1, rotate: 0 } : undefined}
      transition={animated ? { type: "spring", stiffness: 500, damping: 20 } : undefined}
    >
      <span className={sizeConfig.icon}>{config.icon}</span>
      <span className={sizeConfig.text}>
        {score}/100
      </span>
      
      {/* プログレスバー */}
      <div className="w-12 h-1.5 bg-white/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-current rounded-full"
          initial={animated ? { width: 0 } : { width: `${score}%` }}
          animate={{ width: `${score}%` }}
          transition={animated ? { delay: 0.3, duration: 0.5 } : undefined}
        />
      </div>
    </motion.div>
  )
}

// プルスエフェクト（進行中タスク用）
interface PulseIndicatorProps {
  size?: number
  color?: string
  speed?: number
}

export function PulseIndicator({ 
  size = 8, 
  color = "#3b82f6",
  speed = 2
}: PulseIndicatorProps) {
  return (
    <div className="relative">
      <motion.div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: "easeInOut"
        }}
      />
      
      {/* 外側のリング */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: color,
          width: size,
          height: size
        }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.8, 0, 0.8]
        }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

// ローディングスケルトン
interface SkeletonLoaderProps {
  className?: string
  animated?: boolean
}

export function SkeletonLoader({ className, animated = true }: SkeletonLoaderProps) {
  return (
    <div className={cn("bg-gray-200 dark:bg-gray-700 rounded", className)}>
      {animated && (
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      )}
    </div>
  )
}

// カスタムフォーカスリング
interface FocusRingProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function FocusRing({ children, className, color = "#3b82f6" }: FocusRingProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div 
      className={cn("relative", className)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{
              boxShadow: `0 0 0 2px ${color}, 0 0 0 4px ${color}25`
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}