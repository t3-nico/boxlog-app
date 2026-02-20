'use client';

import { memo, useCallback } from 'react';

import { Clock, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import type { RecordItem } from '@/features/records/hooks/useRecordData';
import { useDateFormat } from '@/features/settings/hooks/useDateFormat';
import { cn } from '@/lib/utils';

import { TagsContainer } from '../views/shared/components/PlanCard/TagsContainer';

interface RecordListCardProps {
  record: RecordItem;
  onClick?: (record: RecordItem) => void;
}

/**
 * アサイド用の Record カード
 *
 * PlanListCard と同構造だが：
 * - チェックボックスなし（Record にはステータスがない）
 * - D&D なし → cursor-pointer 固定
 * - 透明背景 + 3px左縦線アクセント（record-border）
 * - 充実度スコア表示（1-5）
 * - 所要時間表示
 */
export const RecordListCard = memo<RecordListCardProps>(function RecordListCard({
  record,
  onClick,
}) {
  const t = useTranslations('calendar');
  const { formatTime, formatDate } = useDateFormat();

  // 時間表示
  // Record の start_time/end_time は time-only 文字列（"09:00:00"）の場合がある
  // worked_at と組み合わせて有効な Date を構築する
  const parseRecordTime = (timeStr: string): Date | null => {
    // フル ISO datetime の場合はそのまま
    if (timeStr.includes('T') || timeStr.includes('-')) {
      const d = new Date(timeStr);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    // time-only（"09:00:00"）の場合は worked_at と組み合わせ
    const d = new Date(`${record.worked_at}T${timeStr}`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const startDate = record.start_time ? parseRecordTime(record.start_time) : null;
  const endDate = record.end_time ? parseRecordTime(record.end_time) : null;
  const startTime = startDate ? formatTime(startDate) : '';
  const endTime = endDate ? formatTime(endDate) : '';
  const displayTime = startTime && endTime ? `${startTime} - ${endTime}` : null;

  // 日付表示
  const displayDate = record.worked_at ? formatDate(new Date(record.worked_at)) : null;

  const handleCardClick = useCallback(() => {
    onClick?.(record);
  }, [onClick, record]);

  return (
    <Card
      className={cn(
        // レイアウト
        'group relative flex flex-row items-start gap-2 py-2 pr-3 pl-3',
        // 左ボーダーアクセント（Apple Calendar 風）
        'border-l-record-border border-l-[3px]',
        // 背景なし（縦線のみのリスト表示）
        'bg-transparent',
        // Card デフォルト打ち消し
        'rounded-none border-y-0 border-r-0 shadow-none',
        // ホバー（オーバーレイ方式）
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:transition-colors',
        'hover:after:bg-state-hover',
        // トランジション
        'transition-colors duration-150',
        // フォーカス
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        // カーソル
        'cursor-pointer',
      )}
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
    >
      {/* コンテンツ */}
      <div className="min-w-0 flex-1">
        {/* タイトル */}
        <p className="text-foreground line-clamp-2 text-sm leading-tight font-normal">
          {record.title || t('aside.noTitle')}
        </p>

        {/* メタ情報行: 日付 + 時間 + 所要時間 */}
        <div className="mt-1 flex items-center gap-2">
          {/* 日付 */}
          {displayDate && (
            <span className="text-muted-foreground text-xs tabular-nums">{displayDate}</span>
          )}

          {/* 時間 */}
          {displayTime && (
            <span className="text-muted-foreground text-xs tabular-nums">{displayTime}</span>
          )}

          {/* 所要時間 */}
          {record.duration_minutes > 0 && (
            <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
              <Clock className="size-3" />
              {t('aside.duration', { minutes: record.duration_minutes })}
            </span>
          )}
        </div>

        {/* 充実度スコア */}
        {record.fulfillment_score != null && record.fulfillment_score > 0 && (
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-3',
                  i < record.fulfillment_score!
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground/30',
                )}
              />
            ))}
          </div>
        )}

        {/* タグ */}
        {record.tagIds && record.tagIds.length > 0 && <TagsContainer tagIds={record.tagIds} />}
      </div>
    </Card>
  );
});
