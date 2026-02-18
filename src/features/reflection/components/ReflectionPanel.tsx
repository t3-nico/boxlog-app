'use client';

import { useCallback, useState } from 'react';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { Reflection } from '../types';

import { ReflectionContent } from './ReflectionContent';
import { ReflectionListView } from './ReflectionListView';

interface ReflectionPanelProps {
  /** 全Reflectionデータ（リスト表示用） */
  reflections: Reflection[];
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
 * リストビューと詳細ビューを切り替え表示する。
 * - selectedId === null → リストビュー（ReflectionListView）
 * - selectedId !== null → 詳細ビュー（ReflectionContent）
 */
export function ReflectionPanel({
  reflections,
  isLoading,
  onGenerate,
  onUserNoteChange,
}: ReflectionPanelProps) {
  const t = useTranslations('calendar.reflection');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

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

  // 詳細ビュー
  if (selectedId !== null) {
    const selected = reflections.find((r) => r.id === selectedId);

    if (!selected) {
      setSelectedId(null);
      return null;
    }

    return (
      <div className="flex h-full flex-col">
        {/* 戻るヘッダー */}
        <div className="flex shrink-0 items-center px-4 py-2">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={handleBack}>
            <ArrowLeft className="size-4" />
            {t('list.back')}
          </Button>
        </div>

        {/* 詳細コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          <ReflectionContent reflection={selected} onUserNoteChange={onUserNoteChange} />
        </div>
      </div>
    );
  }

  // リストビュー
  const summaries = reflections.map((r) => ({
    id: r.id,
    date: r.date,
    title: r.title,
  }));

  return (
    <ReflectionListView reflections={summaries} onSelect={setSelectedId} onGenerate={onGenerate} />
  );
}
