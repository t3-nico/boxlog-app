'use client';

import { Clock, Plus, Smile, Trash2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { useRecordData, useRecordMutations, type RecordItem } from '../hooks';
import { useRecordInspectorStore } from '../stores';
import { RecordInspector } from './RecordInspector';

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
 * 充実度をアイコンで表示
 */
function FulfillmentScore({ score }: { score: number | null }) {
  if (!score) return <span className="text-muted-foreground">-</span>;

  const colors = [
    'text-red-500',
    'text-orange-500',
    'text-yellow-500',
    'text-lime-500',
    'text-green-500',
  ];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Smile
          key={i}
          className={cn('size-4', i < score ? colors[score - 1] : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}

/**
 * Record Table View コンポーネント
 *
 * テーブル形式でRecordを表示
 */
export function RecordTableView() {
  const locale = useLocale();
  const { items, isPending } = useRecordData();
  const { deleteRecord } = useRecordMutations();
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const openInspector = useRecordInspectorStore((state) => state.openInspector);
  const isInspectorOpen = useRecordInspectorStore((state) => state.isOpen);

  // ローディング表示
  if (isPending && items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 空状態
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Clock className="text-muted-foreground size-12" />
        <div className="text-center">
          <p className="text-muted-foreground">まだRecordがありません</p>
          <p className="text-muted-foreground text-sm">作業ログを記録しましょう</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          Record作成
        </Button>
      </div>
    );
  }

  const handleRowClick = (record: RecordItem) => {
    openInspector(record.id);
  };

  const handleDelete = async (e: React.MouseEvent, recordId: string) => {
    e.stopPropagation();
    if (!window.confirm('このRecordを削除しますか？')) return;
    await deleteRecord.mutateAsync({ id: recordId });
  };

  return (
    <div className="flex h-full">
      {/* テーブル */}
      <div className={cn('flex-1 overflow-hidden', isInspectorOpen && 'pr-0')}>
        {/* ツールバー */}
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">{items.length}件のRecord</span>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            Record作成
          </Button>
        </div>

        {/* テーブル本体 */}
        <div className="h-[calc(100%-48px)] overflow-auto px-4">
          <div className="border-border rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-container hover:bg-surface-container">
                  <TableHead className="w-10">
                    <Checkbox disabled />
                  </TableHead>
                  <TableHead className="w-28">作業日</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="w-28">時間</TableHead>
                  <TableHead className="w-32">充実度</TableHead>
                  <TableHead>メモ</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((record) => (
                  <TableRow
                    key={record.id}
                    className={cn(
                      'cursor-pointer',
                      selectedRecordId === record.id && 'bg-state-selected',
                    )}
                    onClick={() => handleRowClick(record)}
                  >
                    <TableCell>
                      <Checkbox
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => {
                          // TODO: 選択機能
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{record.worked_at}</TableCell>
                    <TableCell>
                      {record.plan ? (
                        <Link
                          href={`/${locale}/plan?selected=${record.plan.id}`}
                          className="text-link hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {record.plan.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDuration(record.duration_minutes)}</TableCell>
                    <TableCell>
                      <FulfillmentScore score={record.fulfillment_score} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.note || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => handleDelete(e, record.id)}
                      >
                        <Trash2 className="text-muted-foreground size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Inspector */}
      {isInspectorOpen && <RecordInspector />}
    </div>
  );
}
