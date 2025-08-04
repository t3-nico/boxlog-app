/**
 * 統一されたローディング状態コンポーネント
 * 様々なサイズ・用途に対応したローディング表示
 */

'use client'

import React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// === 型定義 ===

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  'aria-label'?: string
}

export interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
  spinnerSize?: LoadingSpinnerProps['size']
}

export interface LoadingCardProps {
  title?: string
  message?: string
  className?: string
}

export interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
}

// === スピナーコンポーネント ===

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  'aria-label': ariaLabel = 'Loading...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-gray-500',
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
      role="status"
    />
  )
}

// === リフレッシュスピナー ===

export function RefreshSpinner({ 
  size = 'md', 
  className = '', 
  'aria-label': ariaLabel = 'Refreshing...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <RefreshCw
      className={cn(
        'animate-spin text-blue-500',
        sizeClasses[size],
        className
      )}
      aria-label={ariaLabel}
      role="status"
    />
  )
}

// === ローディングオーバーレイ ===

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = '読み込み中...', 
  className = '',
  spinnerSize = 'md'
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size={spinnerSize} />
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// === ローディングカード ===

export function LoadingCard({ 
  title = '読み込み中', 
  message = 'データを読み込んでいます...', 
  className = '' 
}: LoadingCardProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
      className
    )}>
      <LoadingSpinner size="lg" className="mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-center max-w-sm">
        {message}
      </p>
    </div>
  )
}

// === ローディングボタン ===

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText, 
  className = '',
  disabled = false,
  onClick,
  variant = 'default'
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  }

  const sizeClasses = 'h-10 px-4 py-2'

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses,
        className
      )}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {isLoading && loadingText ? loadingText : children}
    </button>
  )
}

// === スケルトンコンポーネント ===

export interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  )
}

// === スケルトンテキスト ===

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full' // 最後の行は少し短く
          )}
        />
      ))}
    </div>
  )
}

// === スケルトンカード ===

export interface SkeletonCardProps {
  showAvatar?: boolean
  showImage?: boolean
  className?: string
}

export function SkeletonCard({ 
  showAvatar = false, 
  showImage = false, 
  className = '' 
}: SkeletonCardProps) {
  return (
    <div className={cn(
      'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
      className
    )}>
      {showImage && (
        <Skeleton className="w-full h-40 mb-4" />
      )}
      
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        )}
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

// === データローディング状態 ===

export interface DataLoadingProps {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  className?: string
}

export function DataLoading({
  isLoading,
  isError,
  isEmpty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = ''
}: DataLoadingProps) {
  if (isLoading) {
    return (
      <div className={cn('flex justify-center items-center p-8', className)}>
        {loadingComponent || <LoadingSpinner size="lg" />}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('flex justify-center items-center p-8', className)}>
        {errorComponent || (
          <div className="text-center">
            <p className="text-red-500 mb-2">データの読み込みに失敗しました</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-500 hover:underline"
            >
              再試行
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={cn('flex justify-center items-center p-8', className)}>
        {emptyComponent || (
          <p className="text-gray-500">データがありません</p>
        )}
      </div>
    )
  }

  return <>{children}</>
}

// === プリセットローディング状態 ===

export const PresetLoadings = {
  // ページローディング
  Page: () => (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingCard 
        title="ページを読み込み中"
        message="しばらくお待ちください..."
      />
    </div>
  ),

  // テーブルローディング
  Table: ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  ),

  // リストローディング
  List: ({ items = 3 }: { items?: number }) => (
    <div className="space-y-4">
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} showAvatar />
      ))}
    </div>
  ),

  // フォームローディング
  Form: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

const LoadingStates = {
  Spinner: LoadingSpinner,
  Overlay: LoadingOverlay,
  Card: LoadingCard,
  Button: LoadingButton,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  DataLoading,
  PresetLoadings
}

export default LoadingStates