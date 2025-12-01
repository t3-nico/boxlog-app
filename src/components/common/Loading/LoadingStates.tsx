/**
 * 統一されたローディング状態コンポーネント
 * 様々なサイズ・用途に対応したローディング表示
 */

'use client'

import React, { useCallback } from 'react'

import { Loader2, RefreshCw } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'
import { cn } from '@/lib/utils'

import { LoadingButtonProps, LoadingCardProps, LoadingOverlayProps, LoadingSpinnerProps } from './types'

// === スピナーコンポーネント ===

export const LoadingSpinner = ({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Loading...',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-neutral-600 dark:text-neutral-400',
        Object.prototype.hasOwnProperty.call(sizeClasses, size) ? sizeClasses[size as keyof typeof sizeClasses] : '',
        className
      )}
      aria-label={ariaLabel}
      role="status"
    />
  )
}

// === リフレッシュスピナー ===

export const RefreshSpinner = ({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Refreshing...',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <RefreshCw
      className={cn(
        'animate-spin text-blue-600 dark:text-blue-400',
        Object.prototype.hasOwnProperty.call(sizeClasses, size) ? sizeClasses[size as keyof typeof sizeClasses] : '',
        className
      )}
      aria-label={ariaLabel}
      role="status"
    />
  )
}

// === ローディングオーバーレイ ===

export const LoadingOverlay = ({
  isLoading,
  children,
  message,
  className = '',
  spinnerSize = 'md',
}: LoadingOverlayProps) => {
  const { t } = useI18n()
  const displayMessage = message ?? t('errors.loading.default')

  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading === true && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-100/80 backdrop-blur-sm dark:bg-neutral-900/80">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size={spinnerSize} />
            {displayMessage ? (
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{displayMessage}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

// === ローディングカード ===

export const LoadingCard = ({ title, message, className = '' }: LoadingCardProps) => {
  const { t } = useI18n()
  const displayTitle = title ?? t('errors.loading.title')
  const displayMessage = message ?? t('errors.loading.loadingData')

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md bg-white p-8 shadow-sm dark:bg-neutral-800',
        className
      )}
    >
      <LoadingSpinner size="lg" className="mb-4" />
      <h3 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{displayTitle}</h3>
      <p className="max-w-sm text-center text-neutral-800 dark:text-neutral-200">{displayMessage}</p>
    </div>
  )
}

// === ローディングボタン ===

export const LoadingButton = ({
  isLoading,
  children,
  loadingText,
  className = '',
  disabled = false,
  onClick,
  variant = 'default',
}: LoadingButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/92 active:bg-primary/88',
    outline: 'border border-input bg-background hover:bg-foreground/8 active:bg-foreground/12',
    ghost: 'hover:bg-foreground/8 active:bg-foreground/12',
  }

  const sizeClasses = 'h-10 px-4 py-2'

  return (
    <button
      type="button"
      className={cn(
        baseClasses,
        Object.prototype.hasOwnProperty.call(variantClasses, variant)
          ? variantClasses[variant as keyof typeof variantClasses]
          : '',
        sizeClasses,
        className
      )}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
      {isLoading && loadingText ? loadingText : children}
    </button>
  )
}

// === スケルトンコンポーネント ===

export interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700', className)} />
}

// === スケルトンテキスト ===

export interface SkeletonTextProps {
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 3, className = '' }: SkeletonTextProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
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

export const SkeletonCard = ({ showAvatar = false, showImage = false, className = '' }: SkeletonCardProps) => {
  return (
    <div className={cn('rounded-md bg-white p-4 shadow-sm dark:bg-neutral-800', className)}>
      {showImage ? <Skeleton className="mb-4 h-40 w-full" /> : null}

      <div className="flex items-start gap-2">
        {showAvatar ? <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" /> : null}

        <div className="flex flex-1 flex-col gap-2">
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

export const DataLoading = ({
  isLoading,
  isError,
  isEmpty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className = '',
}: DataLoadingProps) => {
  const { t } = useI18n()
  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {loadingComponent || <LoadingSpinner size="lg" />}
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {errorComponent || (
          <div className="text-center">
            <p className="mb-2 text-red-600 dark:text-red-400">{t('errors.loading.loadFailed')}</p>
            <button type="button" onClick={handleReload} className="text-blue-600 hover:underline dark:text-blue-400">
              {t('errors.loading.retry')}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {emptyComponent || <p className="text-neutral-600 dark:text-neutral-400">{t('errors.loading.noData')}</p>}
      </div>
    )
  }

  return <>{children}</>
}

// === プリセットローディング状態 ===

// ページローディング
function PageLoading() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingCard title={t('errors.loading.loadingPage')} message={t('errors.loading.pleaseWait')} />
    </div>
  )
}

// テーブルローディング
function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

// リストローディング
function ListLoading({ items = 3 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} showAvatar />
      ))}
    </div>
  )
}

// フォームローディング
function FormLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  )
}

export const PresetLoadings = {
  Page: PageLoading,
  Table: TableLoading,
  List: ListLoading,
  Form: FormLoading,
}

export const LoadingStates = {
  Spinner: LoadingSpinner,
  Overlay: LoadingOverlay,
  Card: LoadingCard,
  Button: LoadingButton,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  DataLoading,
  PresetLoadings,
}
