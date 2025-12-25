/**
 * 統一されたローディング状態コンポーネント
 * 様々なサイズ・用途に対応したローディング表示
 */

'use client';

import React, { useCallback } from 'react';

import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { Skeleton, type SkeletonAnimation } from '@/components/ui/skeleton';

import {
  LoadingButtonProps,
  LoadingCardProps,
  LoadingOverlayProps,
  LoadingSpinnerProps,
} from './types';

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
  };

  return (
    <Loader2
      className={cn(
        'text-muted-foreground animate-spin motion-reduce:animate-none',
        Object.prototype.hasOwnProperty.call(sizeClasses, size)
          ? sizeClasses[size as keyof typeof sizeClasses]
          : '',
        className,
      )}
      aria-label={ariaLabel}
      role="status"
    />
  );
};

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
  };

  return (
    <RefreshCw
      className={cn(
        'text-primary animate-spin motion-reduce:animate-none',
        Object.prototype.hasOwnProperty.call(sizeClasses, size)
          ? sizeClasses[size as keyof typeof sizeClasses]
          : '',
        className,
      )}
      aria-label={ariaLabel}
      role="status"
    />
  );
};

// === ローディングオーバーレイ ===

export const LoadingOverlay = ({
  isLoading,
  children,
  message,
  className = '',
  spinnerSize = 'md',
}: LoadingOverlayProps) => {
  const t = useTranslations();
  const displayMessage = message ?? t('error.loading.default');

  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading === true && (
        <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size={spinnerSize} />
            {displayMessage ? (
              <p className="text-foreground text-sm font-medium">{displayMessage}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// === ローディングカード ===

export const LoadingCard = ({ title, message, className = '' }: LoadingCardProps) => {
  const t = useTranslations();
  const displayTitle = title ?? t('error.loading.title');
  const displayMessage = message ?? t('error.loading.loadingData');

  return (
    <div
      className={cn(
        'bg-card flex flex-col items-center justify-center rounded-md p-8 shadow-sm',
        className,
      )}
    >
      <LoadingSpinner size="lg" className="mb-4" />
      <h3 className="text-card-foreground mb-2 text-3xl font-bold tracking-tight">
        {displayTitle}
      </h3>
      <p className="text-muted-foreground max-w-sm text-center">{displayMessage}</p>
    </div>
  );
};

// === ローディングボタン ===

export const LoadingButton = ({
  isLoading,
  children,
  loadingText,
  className = '',
  disabled = false,
  onClick,
  variant = 'primary',
}: LoadingButtonProps) => {
  // variantのマッピング（LoadingButtonPropsのvariantをui/Buttonのvariantに変換）
  const buttonVariant =
    variant === 'primary' ? 'primary' : variant === 'outline' ? 'outline' : 'ghost';

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size="lg"
      className={className}
      disabled={disabled}
      isLoading={isLoading}
      {...(loadingText && { loadingText })}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

// === スケルトンコンポーネント ===
// Skeleton は ui/skeleton.tsx から re-export
export { Skeleton, type SkeletonAnimation } from '@/components/ui/skeleton';

// === スケルトンテキスト ===

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  animation?: SkeletonAnimation;
}

export const SkeletonText = ({
  lines = 3,
  className = '',
  animation = 'pulse',
}: SkeletonTextProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          animation={animation}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full', // 最後の行は少し短く
          )}
        />
      ))}
    </div>
  );
};

// === スケルトンカード ===

export interface SkeletonCardProps {
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
  animation?: SkeletonAnimation;
}

export const SkeletonCard = ({
  showAvatar = false,
  showImage = false,
  className = '',
  animation = 'pulse',
}: SkeletonCardProps) => {
  return (
    <div className={cn('bg-card rounded-md p-4 shadow-sm', className)}>
      {showImage ? <Skeleton animation={animation} className="mb-4 h-40 w-full" /> : null}

      <div className="flex items-start gap-2">
        {showAvatar ? (
          <Skeleton animation={animation} className="h-10 w-10 flex-shrink-0 rounded-full" />
        ) : null}

        <div className="flex flex-1 flex-col gap-2">
          <Skeleton animation={animation} className="h-4 w-3/4" />
          <Skeleton animation={animation} className="h-4 w-1/2" />
          <div className="space-y-1">
            <Skeleton animation={animation} className="h-3 w-full" />
            <Skeleton animation={animation} className="h-3 w-full" />
            <Skeleton animation={animation} className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
};

// === データローディング状態 ===

export interface DataLoadingProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
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
  const t = useTranslations();
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {loadingComponent || <LoadingSpinner size="lg" />}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {errorComponent || (
          <div className="text-center">
            <p className="text-destructive mb-2">{t('error.loading.loadFailed')}</p>
            <Button type="button" variant="text" onClick={handleReload}>
              {t('error.loading.retry')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {emptyComponent || <p className="text-muted-foreground">{t('error.loading.noData')}</p>}
      </div>
    );
  }

  return <>{children}</>;
};

// === プリセットローディング状態 ===

// ページローディング
function PageLoading() {
  const t = useTranslations();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingCard title={t('error.loading.loadingPage')} message={t('error.loading.pleaseWait')} />
    </div>
  );
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
  );
}

// リストローディング
function ListLoading({ items = 3 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} showAvatar />
      ))}
    </div>
  );
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
  );
}

export const PresetLoadings = {
  Page: PageLoading,
  Table: TableLoading,
  List: ListLoading,
  Form: FormLoading,
};

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
};
