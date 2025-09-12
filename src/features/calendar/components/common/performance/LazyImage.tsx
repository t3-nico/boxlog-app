'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'

import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  placeholder?: string
  blurHash?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
  rootMargin?: string
  threshold?: number
}

interface ImageState {
  isLoaded: boolean
  isIntersecting: boolean
  hasError: boolean
  isLoading: boolean
}

// Intersection Observer インスタンスのシングルトン管理
let imageObserver: IntersectionObserver | null = null
const observerCallbacks = new Map<Element, () => void>()

function getImageObserver(rootMargin: string = '50px', threshold: number = 0.1): IntersectionObserver {
  if (!imageObserver) {
    imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = observerCallbacks.get(entry.target)
            if (callback) {
              callback()
              imageObserver?.unobserve(entry.target)
              observerCallbacks.delete(entry.target)
            }
          }
        })
      },
      {
        rootMargin,
        threshold
      }
    )
  }
  return imageObserver
}

export const LazyImage = ({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  blurHash,
  priority = false,
  onLoad,
  onError,
  rootMargin = '50px',
  threshold = 0.1
}: LazyImageProps) => {
  const [state, setState] = useState<ImageState>({
    isLoaded: false,
    isIntersecting: priority, // 優先度が高い場合は即座に読み込み
    hasError: false,
    isLoading: false
  })
  
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer の設定
  useEffect(() => {
    if (priority || state.isIntersecting) return

    const element = containerRef.current
    if (!element) return

    const observer = getImageObserver(rootMargin, threshold)
    
    const callback = () => {
      setState(prev => ({ ...prev, isIntersecting: true }))
    }
    
    observerCallbacks.set(element, callback)
    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observerCallbacks.delete(element)
    }
  }, [priority, state.isIntersecting, rootMargin, threshold])

  // 画像の読み込み処理
  useEffect(() => {
    if (!state.isIntersecting || state.isLoaded || state.hasError || state.isLoading) {
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    // 新しい Image オブジェクトで事前読み込み
    const img = new Image()
    
    img.onload = () => {
      setState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        isLoading: false 
      }))
      onLoad?.()
    }

    img.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        hasError: true, 
        isLoading: false 
      }))
      onError?.()
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [state.isIntersecting, state.isLoaded, state.hasError, state.isLoading, src, onLoad, onError])

  // プレースホルダーのスタイル
  const placeholderStyle = useMemo(() => {
    const style: React.CSSProperties = {
      width: width || '100%',
      height: height || 'auto',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }

    // BlurHash サポート（将来的な拡張）
    if (blurHash && !state.isLoaded) {
      style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(createBlurPlaceholder())}")`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
    }

    return style
  }, [width, height, blurHash, state.isLoaded])

  // シンプルなブラープレースホルダー生成
  function createBlurPlaceholder(): string {
    return `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="8"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#blur)"/>
      </svg>
    `
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        width: width || '100%',
        height: height || 'auto'
      }}
    >
      {/* プレースホルダー */}
      {(!state.isLoaded || state.hasError) && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            state.isLoaded ? "opacity-0" : "opacity-100"
          )}
          style={placeholderStyle}
        >
          {state.hasError ? (
            <div className="text-gray-400 text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">読み込みエラー</span>
            </div>
          ) : state.isLoading ? (
            <div className="text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
              <span className="text-xs">読み込み中...</span>
            </div>
          ) : placeholder ? (
            <img 
              src={placeholder} 
              alt={alt}
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* 実際の画像 */}
      {state.isIntersecting && !state.hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            state.isLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: width || '100%',
            height: height || 'auto'
          }}
        />
      )}
    </div>
  )
}

// アイコン用の遅延読み込みコンポーネント
interface LazyIconProps {
  name: string
  size?: number
  className?: string
  priority?: boolean
}

// アイコンキャッシュ
const iconCache = new Map<string, string>()
const iconPromises = new Map<string, Promise<string>>()

async function loadIcon(name: string): Promise<string> {
  // キャッシュチェック
  if (iconCache.has(name)) {
    return iconCache.get(name)!
  }

  // 既に読み込み中の場合は同じPromiseを返す
  if (iconPromises.has(name)) {
    return iconPromises.get(name)!
  }

  const promise = new Promise<string>(async (resolve, reject) => {
    try {
      // 動的インポートでアイコンを読み込み（例: lucide-react）
      const iconModule = await import(`lucide-react`)
      const IconComponent = iconModule[name as keyof typeof iconModule]
      
      if (IconComponent) {
        // SVGストリングに変換（実際の実装はアイコンライブラリに依存）
        const svgString = `<svg><!-- ${name} icon --></svg>`
        iconCache.set(name, svgString)
        resolve(svgString)
      } else {
        reject(new Error(`Icon ${name} not found`))
      }
    } catch (error) {
      reject(error)
    }
  })

  iconPromises.set(name, promise)
  
  try {
    const result = await promise
    iconPromises.delete(name)
    return result
  } catch (error) {
    iconPromises.delete(name)
    throw error
  }
}

export const LazyIcon = ({ 
  name, 
  size = 24, 
  className, 
  priority = false 
}: LazyIconProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(priority)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer の設定
  useEffect(() => {
    if (priority || isIntersecting) return

    const element = containerRef.current
    if (!element) return

    const observer = getImageObserver('50px', 0.1)
    
    const callback = () => {
      setIsIntersecting(true)
    }
    
    observerCallbacks.set(element, callback)
    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observerCallbacks.delete(element)
    }
  }, [priority, isIntersecting])

  // アイコンの読み込み
  useEffect(() => {
    if (!isIntersecting || isLoaded || hasError) return

    loadIcon(name)
      .then(() => setIsLoaded(true))
      .catch(() => setHasError(true))
  }, [isIntersecting, isLoaded, hasError, name])

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      {hasError ? (
        <div 
          className="bg-gray-200 rounded"
          style={{ width: size, height: size }}
        />
      ) : !isLoaded ? (
        <div 
          className="bg-gray-100 animate-pulse rounded"
          style={{ width: size, height: size }}
        />
      ) : (
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ 
            __html: iconCache.get(name) || '' 
          }}
        />
      )}
    </div>
  )
}

// パフォーマンス監視用のユーティリティ
export function useImagePerformance() {
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    loadedImages: 0,
    errorImages: 0,
    averageLoadTime: 0
  })

  const trackImageLoad = (loadTime: number) => {
    setMetrics(prev => ({
      ...prev,
      loadedImages: prev.loadedImages + 1,
      averageLoadTime: (prev.averageLoadTime * (prev.loadedImages - 1) + loadTime) / prev.loadedImages
    }))
  }

  const trackImageError = () => {
    setMetrics(prev => ({
      ...prev,
      errorImages: prev.errorImages + 1
    }))
  }

  return {
    metrics,
    trackImageLoad,
    trackImageError
  }
}

// クリーンアップ関数
export function cleanupImageObserver() {
  if (imageObserver) {
    imageObserver.disconnect()
    imageObserver = null
  }
  observerCallbacks.clear()
  iconCache.clear()
  iconPromises.clear()
}