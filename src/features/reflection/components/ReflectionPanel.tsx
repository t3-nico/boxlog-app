'use client';

import { Skeleton } from '@/components/ui/skeleton';

import type { Reflection } from '../types';

import { ReflectionContent } from './ReflectionContent';
import { ReflectionEmptyState } from './ReflectionEmptyState';

interface ReflectionPanelProps {
  /** Reflectionデータ（null = 未生成） */
  reflection: Reflection | null;
  /** 生成中か */
  isLoading?: boolean;
  /** 生成ボタンのコールバック */
  onGenerate?: () => void;
  /** ユーザーメモの変更コールバック */
  onUserNoteChange?: (value: string) => void;
}

/**
 * Reflection（AI日報）パネル
 *
 * 状態に応じてEmptyState / Loading / Contentを切り替え表示。
 * CalendarAsideから呼び出される。
 */
export function ReflectionPanel({
  reflection,
  isLoading,
  onGenerate,
  onUserNoteChange,
}: ReflectionPanelProps) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
            <Skeleton className="h-24" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!reflection) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center">
          <ReflectionEmptyState onGenerate={onGenerate ?? (() => {})} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <ReflectionContent reflection={reflection} onUserNoteChange={onUserNoteChange} />
      </div>
    </div>
  );
}
