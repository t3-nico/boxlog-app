'use client';

/**
 * Records紐付けアイコンボタン
 *
 * Plan Inspector の Row 3 で使用。
 * Record画面のPlan紐付けと同じUIパターン。
 */

import { useState } from 'react';

import { Clock, Plus, Smile } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useRecordInspectorStore } from '@/features/records/stores';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface RecordsIconButtonProps {
  planId: string;
  disabled?: boolean;
}

/**
 * 時間をフォーマット（分 → 時間:分）
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * 充実度スコアの色を取得
 */
function getScoreColor(score: number): string {
  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-lime-500',
    'text-green-500',
  ];
  return colors[score - 1] ?? 'text-muted-foreground';
}

export function RecordsIconButton({ planId, disabled = false }: RecordsIconButtonProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const openInspectorWithDraft = useRecordInspectorStore((state) => state.openInspectorWithDraft);

  const { data: records, isPending } = api.records.listByPlan.useQuery(
    { planId, sortOrder: 'desc' },
    { enabled: isOpen }, // Popoverが開いた時のみ取得
  );

  const recordCount = records?.length ?? 0;
  const hasRecords = recordCount > 0;

  // 合計時間を計算
  const totalMinutes = records?.reduce((sum, r) => sum + r.duration_minutes, 0) ?? 0;

  // 新しいRecordを作成（このPlanに紐づけて）
  const handleCreateRecord = () => {
    setIsOpen(false);
    openInspectorWithDraft({ plan_id: planId });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip content={hasRecords ? `Records (${recordCount})` : 'Recordを追加'} side="top">
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'relative flex h-8 items-center gap-1 rounded-md px-2 transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              hasRecords ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={hasRecords ? `Records (${recordCount})` : 'Recordを追加'}
          >
            <Clock className="size-4" />
            {hasRecords && (
              <span className="text-sm tabular-nums">{formatDuration(totalMinutes)}</span>
            )}
          </button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
        {isPending ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : !records || records.length === 0 ? (
          <div className="p-4">
            <p className="text-muted-foreground mb-3 text-sm">まだ作業ログがありません</p>
            <Button variant="outline" size="sm" className="w-full" onClick={handleCreateRecord}>
              <Plus className="mr-1 size-3" />
              作業ログを記録
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {/* 合計時間 */}
            <div className="bg-surface-container mb-2 flex items-center justify-between rounded-md px-3 py-2">
              <span className="text-muted-foreground text-xs">合計</span>
              <span className="text-sm font-medium tabular-nums">
                {formatDuration(totalMinutes)}
              </span>
            </div>

            {/* Records リスト */}
            <div className="max-h-60 space-y-0.5 overflow-y-auto">
              {records.map((record) => (
                <Link
                  key={record.id}
                  href={`/${locale}/record?selected=${record.id}`}
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-state-hover flex items-center gap-2 rounded-md px-3 py-2 transition-colors"
                >
                  {/* 日付 */}
                  <span className="text-muted-foreground w-16 flex-shrink-0 text-xs">
                    {record.worked_at}
                  </span>

                  {/* 時間 */}
                  <span className="text-sm tabular-nums">
                    {formatDuration(record.duration_minutes)}
                  </span>

                  {/* 充実度 */}
                  {record.fulfillment_score && (
                    <Smile
                      className={cn(
                        'size-4 flex-shrink-0',
                        getScoreColor(record.fulfillment_score),
                      )}
                    />
                  )}

                  {/* メモ（あれば省略表示） */}
                  {record.note && (
                    <span className="text-muted-foreground flex-1 truncate text-xs">
                      {record.note}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* 新規作成ボタン */}
            <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={handleCreateRecord}>
              <Plus className="mr-1 size-3" />
              作業ログを追加
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
