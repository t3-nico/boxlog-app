'use client'

import { useEffect } from 'react'

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

import type { ParallaxProps, SpringAnimationProps, StaggeredAnimationProps, TouchAnimationProps } from '../types'
import { GPU_OPTIMIZED_STYLES } from '../types'

// ステガード（段階的）アニメーション
export function StaggeredAnimation({ children, staggerDelay = 0.05, className }: StaggeredAnimationProps) {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={GPU_OPTIMIZED_STYLES}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants} style={GPU_OPTIMIZED_STYLES}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// スプリングアニメーション（高性能な物理ベースアニメーション）
export function SpringAnimation({
  children,
  isActive,
  springConfig = { stiffness: 300, damping: 30, mass: 1 },
  className,
}: SpringAnimationProps) {
  const scaleValue = useMotionValue(1)
  const springScale = useSpring(scaleValue, springConfig)

  useEffect(() => {
    scaleValue.set(isActive ? 1.05 : 1)
  }, [isActive, scaleValue])

  return (
    <motion.div
      className={className}
      style={{
        scale: springScale,
        ...GPU_OPTIMIZED_STYLES,
      }}
    >
      {children}
    </motion.div>
  )
}

// パララックス効果
export function Parallax({ children, offset, className }: ParallaxProps) {
  const prefersReducedMotion = useReducedMotion()
  const y = useMotionValue(0)
  const springY = useSpring(y, { stiffness: 400, damping: 90 })

  useEffect(() => {
    if (!prefersReducedMotion) {
      const handleScroll = () => {
        const scrolled = window.scrollY
        y.set(scrolled * offset)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
    return undefined
  }, [offset, y, prefersReducedMotion])

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{
        y: springY,
        ...GPU_OPTIMIZED_STYLES,
      }}
    >
      {children}
    </motion.div>
  )
}

// モバイル対応のタッチアニメーション
export function TouchAnimation({ children, onTap, className }: TouchAnimationProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      transition={{ duration: 0.1, ease: 'easeInOut' }}
      {...(onTap && { onTap })}
      style={GPU_OPTIMIZED_STYLES}
    >
      {children}
    </motion.div>
  )
}
