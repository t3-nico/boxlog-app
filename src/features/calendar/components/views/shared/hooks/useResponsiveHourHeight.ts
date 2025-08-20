/**
 * レスポンシブなHOUR_HEIGHTを管理するフック
 */

import { useState, useEffect } from 'react'
import { HOUR_HEIGHT } from '../constants/grid.constants'

interface ResponsiveHourHeightConfig {
  mobile: number    // モバイル（< 768px）
  tablet: number    // タブレット（768px - 1024px）
  desktop: number   // デスクトップ（>= 1024px）
}

const DEFAULT_CONFIG: ResponsiveHourHeightConfig = {
  mobile: 60,   // モバイルでは少し小さく
  tablet: 72,   // タブレットは標準
  desktop: 72   // デスクトップは標準
}

export function useResponsiveHourHeight(
  config: Partial<ResponsiveHourHeightConfig> = {}
): number {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [hourHeight, setHourHeight] = useState<number>(HOUR_HEIGHT)
  
  useEffect(() => {
    const updateHourHeight = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        // モバイル
        setHourHeight(finalConfig.mobile)
      } else if (width < 1024) {
        // タブレット
        setHourHeight(finalConfig.tablet)
      } else {
        // デスクトップ
        setHourHeight(finalConfig.desktop)
      }
    }
    
    // 初期設定
    updateHourHeight()
    
    // リサイズイベントリスナー
    window.addEventListener('resize', updateHourHeight)
    
    return () => {
      window.removeEventListener('resize', updateHourHeight)
    }
  }, [finalConfig.mobile, finalConfig.tablet, finalConfig.desktop])
  
  return hourHeight
}

/**
 * ブレークポイント判定用のフック
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setBreakpoint('mobile')
      } else if (width < 1024) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])
  
  return breakpoint
}