'use client';

import { useCallback } from 'react';

import type { ReflectionSummary } from '../types';

interface ReflectionListCardProps {
  reflection: ReflectionSummary;
  onClick?: (id: string) => void;
}

/**
 * Reflection一覧用の行アイテム
 *
 * タイトル + 日付の2行、ghostスタイル。
 * クリックで詳細ビューへ遷移する。
 */
export function ReflectionListCard({ reflection, onClick }: ReflectionListCardProps) {
  const handleClick = useCallback(() => {
    onClick?.(reflection.id);
  }, [onClick, reflection.id]);

  // 日付を曜日付きでフォーマット（例: "2/17 (Mon)"）
  const dateObj = new Date(`${reflection.date}T00:00:00`);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
  const displayDate = `${month}/${day} (${weekday})`;

  return (
    <button
      type="button"
      className="hover:bg-state-hover focus-visible:ring-ring flex w-full flex-col gap-0.5 rounded px-2 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
      onClick={handleClick}
    >
      <p className="text-foreground line-clamp-1 text-sm leading-tight">{reflection.title}</p>
      <span className="text-muted-foreground text-xs tabular-nums">{displayDate}</span>
    </button>
  );
}
