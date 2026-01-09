'use client';

import type { LucideIcon } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WarningBoxProps {
  /** 表示するメッセージ */
  children: ReactNode;
  /** アイコン（デフォルト: AlertTriangle） */
  icon?: LucideIcon;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 警告ボックス
 *
 * 破壊的操作の警告などに使用
 * shadcn/ui の上に乗せる薄いラッパー
 *
 * @example
 * ```tsx
 * <WarningBox>この操作は取り消せません</WarningBox>
 * <WarningBox icon={Info}>補足情報</WarningBox>
 * ```
 */
export function WarningBox({ children, icon: Icon = AlertTriangle, className }: WarningBoxProps) {
  return (
    <div
      className={cn(
        'border-destructive bg-destructive-container text-destructive flex items-center gap-2 rounded-xl border p-3',
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}

interface InfoBoxProps {
  /** 表示するコンテンツ */
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 情報ボックス
 *
 * 使用状況、説明、詳細情報などに使用
 * shadcn/ui の上に乗せる薄いラッパー
 *
 * @example
 * ```tsx
 * <InfoBox>
 *   <p className="mb-2 text-sm font-medium">使用状況:</p>
 *   <ul>...</ul>
 * </InfoBox>
 * ```
 */
export function InfoBox({ children, className }: InfoBoxProps) {
  return <div className={cn('bg-surface-container rounded-xl p-4', className)}>{children}</div>;
}
