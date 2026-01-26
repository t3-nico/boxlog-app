'use client';

import { Calendar, Clock, Save, Smile, Trash2, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { useRecordMutations, type RecordItem } from '../hooks';
import { useRecordInspectorStore } from '../stores';

/**
 * Record Inspector コンポーネント
 *
 * Record詳細表示・編集用サイドパネル
 */
export function RecordInspector() {
  const locale = useLocale();
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const closeInspector = useRecordInspectorStore((state) => state.closeInspector);

  // Record取得
  const { data: record, isLoading } = api.records.getById.useQuery(
    { id: selectedRecordId!, include: { plan: true } },
    { enabled: !!selectedRecordId },
  );

  // Mutations
  const { updateRecord, deleteRecord } = useRecordMutations();

  // 編集状態
  const [formData, setFormData] = useState({
    worked_at: '',
    start_time: '',
    end_time: '',
    duration_minutes: 0,
    fulfillment_score: null as number | null,
    note: '',
  });
  const [isDirty, setIsDirty] = useState(false);

  // Recordデータを編集フォームに反映
  useEffect(() => {
    if (record) {
      setFormData({
        worked_at: record.worked_at,
        start_time: record.start_time ?? '',
        end_time: record.end_time ?? '',
        duration_minutes: record.duration_minutes,
        fulfillment_score: record.fulfillment_score,
        note: record.note ?? '',
      });
      setIsDirty(false);
    }
  }, [record]);

  // フォーム変更ハンドラ
  const handleChange = useCallback(
    (field: keyof typeof formData, value: string | number | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    },
    [],
  );

  // 保存
  const handleSave = async () => {
    if (!selectedRecordId || !isDirty) return;

    await updateRecord.mutateAsync({
      id: selectedRecordId,
      data: {
        worked_at: formData.worked_at,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        duration_minutes: formData.duration_minutes,
        fulfillment_score: formData.fulfillment_score,
        note: formData.note || null,
      },
    });
    setIsDirty(false);
  };

  // 削除
  const handleDelete = async () => {
    if (!selectedRecordId) return;
    if (!window.confirm('このRecordを削除しますか？')) return;

    await deleteRecord.mutateAsync({ id: selectedRecordId });
    closeInspector();
  };

  // キャンセル
  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm('変更が保存されていません。破棄しますか？')) return;
    }
    closeInspector();
  };

  if (isLoading) {
    return (
      <div className="border-border bg-surface flex h-full w-80 flex-col border-l">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="border-border bg-surface flex h-full w-80 flex-col border-l">
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground text-sm">Recordが見つかりません</p>
        </div>
      </div>
    );
  }

  const typedRecord = record as RecordItem;

  return (
    <div className="border-border bg-surface flex h-full w-80 flex-col border-l">
      {/* ヘッダー */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
        <h2 className="font-medium">Record詳細</h2>
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <X className="size-4" />
        </Button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Plan リンク */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Plan</Label>
            {typedRecord.plan ? (
              <Link
                href={`/${locale}/plan?selected=${typedRecord.plan.id}`}
                className="bg-surface-container hover:bg-opacity-80 flex items-center gap-2 rounded-lg p-2 text-sm"
              >
                <div
                  className={cn(
                    'size-2 rounded-full',
                    typedRecord.plan.status === 'open' ? 'bg-green-500' : 'bg-gray-400',
                  )}
                />
                {typedRecord.plan.title}
              </Link>
            ) : (
              <p className="text-muted-foreground text-sm">-</p>
            )}
          </div>

          {/* 作業日 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="size-3" />
              作業日
            </Label>
            <Input
              type="date"
              value={formData.worked_at}
              onChange={(e) => handleChange('worked_at', e.target.value)}
            />
          </div>

          {/* 時間 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">開始</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">終了</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
              />
            </div>
          </div>

          {/* 作業時間 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="size-3" />
              作業時間（分）
            </Label>
            <Input
              type="number"
              min={1}
              value={formData.duration_minutes}
              onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* 充実度 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1 text-xs">
              <Smile className="size-3" />
              充実度
            </Label>
            <Select
              value={formData.fulfillment_score?.toString() ?? ''}
              onValueChange={(v) => handleChange('fulfillment_score', v ? parseInt(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">未設定</SelectItem>
                <SelectItem value="1">1 - 不満</SelectItem>
                <SelectItem value="2">2 - やや不満</SelectItem>
                <SelectItem value="3">3 - 普通</SelectItem>
                <SelectItem value="4">4 - 満足</SelectItem>
                <SelectItem value="5">5 - 大満足</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* メモ */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">メモ</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="メモを入力..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t p-4">
        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-1 size-4" />
          削除
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isDirty}>
            <Save className="mr-1 size-4" />
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
