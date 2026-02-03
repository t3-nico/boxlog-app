'use client';

/**
 * Records セクション
 * Plan Inspectorに埋め込まれ、紐づくRecordを表示
 */

import { ChevronDown, Clock, Plus, Smile } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRecordInspectorStore } from '@/features/records/stores';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface RecordsSectionProps {
  planId: string;
}

/**
 * 時間をフォーマット（分 → 時間:分）
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}分`;
  }
  return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
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

export function RecordsSection({ planId }: RecordsSectionProps) {
  const locale = useLocale();
  const openInspectorWithDraft = useRecordInspectorStore((state) => state.openInspectorWithDraft);

  const { data: records, isPending } = api.records.listByPlan.useQuery({
    planId,
    sortOrder: 'desc',
  });

  // 合計時間を計算
  const totalMinutes = records?.reduce((sum, r) => sum + r.duration_minutes, 0) ?? 0;

  // 新しいRecordを作成（このPlanに紐づけて）
  const handleCreateRecord = () => {
    openInspectorWithDraft({ plan_id: planId });
  };

  return (
    <Collapsible defaultOpen={true}>
      <CollapsibleTrigger asChild>
        <div className="flex h-10 w-full cursor-pointer items-center gap-2 px-4 transition-colors">
          <div className="border-border/50 h-px flex-1 border-t" />
          <div className="hover:bg-state-hover flex items-center gap-1 rounded px-2 py-1 transition-colors">
            <Clock className="text-muted-foreground size-3" />
            <span className="text-muted-foreground text-xs">
              Records{records && records.length > 0 ? ` (${records.length})` : ''}
            </span>
            <ChevronDown className="text-muted-foreground size-3 transition-transform [[data-state=open]_&]:rotate-180" />
          </div>
          <div className="border-border/50 h-px flex-1 border-t" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {isPending ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : !records || records.length === 0 ? (
          <div className="px-4 pb-4">
            <p className="text-muted-foreground mb-2 text-sm">まだ作業ログがありません</p>
            <Button variant="outline" size="sm" onClick={handleCreateRecord}>
              <Plus className="mr-1 size-3" />
              作業ログを記録
            </Button>
          </div>
        ) : (
          <div className="px-4 pb-4">
            {/* 合計時間 */}
            <div className="bg-surface-container mb-2 flex items-center justify-between rounded-lg p-2">
              <span className="text-muted-foreground text-xs">合計時間</span>
              <span className="text-sm font-bold">{formatDuration(totalMinutes)}</span>
            </div>

            {/* Records リスト */}
            <div className="space-y-2">
              {records.map((record) => (
                <Link
                  key={record.id}
                  href={`/${locale}/record?selected=${record.id}`}
                  className="hover:bg-state-hover flex items-center gap-2 rounded-lg p-2 transition-colors"
                >
                  {/* 日付 */}
                  <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">
                    {record.worked_at}
                  </span>

                  {/* 時間 */}
                  <span className="text-sm">{formatDuration(record.duration_minutes)}</span>

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
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={handleCreateRecord}>
              <Plus className="mr-1 size-3" />
              作業ログを追加
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
