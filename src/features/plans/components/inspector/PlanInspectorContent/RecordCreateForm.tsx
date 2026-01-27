'use client';

import { Calendar, Clock, FileText, ListChecks, Smile } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { ClockTimePicker } from '@/components/common/ClockTimePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { useRecordMutations } from '@/features/records/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';
import { DatePickerPopover } from '../../shared/DatePickerPopover';

import type { FulfillmentScore } from '@/features/records/types/record';

interface RecordFormData {
  title: string;
  plan_id: string | null;
  worked_at: Date | undefined;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  fulfillment_score: FulfillmentScore | null;
  note: string;
}

export interface RecordCreateFormRef {
  save: () => Promise<void>;
  isSaveDisabled: () => boolean;
}

/**
 * Record 作成フォーム
 *
 * PlanInspector のドラフトモード時に表示される Record 入力フォーム
 * PlanInspectorDetailsTab と同じUI構造
 */
export const RecordCreateForm = forwardRef<RecordCreateFormRef>(
  function RecordCreateForm(_props, ref) {
    const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
    const closeInspector = usePlanInspectorStore((state) => state.closeInspector);

    // Plan一覧取得
    const { data: plans } = api.plans.list.useQuery({ status: 'open' });

    // Mutations
    const { createRecord } = useRecordMutations();

    // 今日の日付
    const today = useMemo(() => new Date(), []);

    // draftPlan から初期値を取得
    const initialStartTime = useMemo(() => {
      if (!draftPlan?.start_time) return '';
      const date = new Date(draftPlan.start_time);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }, [draftPlan?.start_time]);

    const initialEndTime = useMemo(() => {
      if (!draftPlan?.end_time) return '';
      const date = new Date(draftPlan.end_time);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }, [draftPlan?.end_time]);

    const initialWorkedAt = useMemo(() => {
      if (draftPlan?.due_date) {
        return new Date(draftPlan.due_date);
      }
      return today;
    }, [draftPlan?.due_date, today]);

    // 初期duration計算
    const calculateDuration = useCallback((start: string, end: string): number => {
      if (!start || !end) return 60;
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
      const endMinutes = (endH ?? 0) * 60 + (endM ?? 0);
      const duration = endMinutes - startMinutes;
      return duration > 0 ? duration : 60;
    }, []);

    // フォーム状態
    const [formData, setFormData] = useState<RecordFormData>({
      title: '',
      plan_id: null,
      worked_at: initialWorkedAt,
      start_time: initialStartTime,
      end_time: initialEndTime,
      duration_minutes: calculateDuration(initialStartTime, initialEndTime),
      fulfillment_score: null,
      note: '',
    });

    // 初期値が変わったら反映
    useEffect(() => {
      setFormData((prev) => ({
        ...prev,
        worked_at: initialWorkedAt,
        start_time: initialStartTime,
        end_time: initialEndTime,
        duration_minutes: calculateDuration(initialStartTime, initialEndTime),
      }));
    }, [initialWorkedAt, initialStartTime, initialEndTime, calculateDuration]);

    // 時間変更時にdurationを自動計算
    useEffect(() => {
      const duration = calculateDuration(formData.start_time, formData.end_time);
      setFormData((prev) => ({ ...prev, duration_minutes: duration }));
    }, [formData.start_time, formData.end_time, calculateDuration]);

    // 時間表示フォーマット（例: "2h 30m"）
    const durationDisplay = useMemo(() => {
      if (formData.duration_minutes <= 0) return '';
      const h = Math.floor(formData.duration_minutes / 60);
      const m = formData.duration_minutes % 60;
      if (h > 0 && m > 0) return `${h}h ${m}m`;
      if (h > 0) return `${h}h`;
      return `${m}m`;
    }, [formData.duration_minutes]);

    // フォーム変更ハンドラ
    const handleTitleChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, title: value }));
    }, []);

    const handlePlanChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, plan_id: value || null }));
    }, []);

    const handleDateChange = useCallback((date: Date | undefined) => {
      setFormData((prev) => ({ ...prev, worked_at: date }));
    }, []);

    const handleStartTimeChange = useCallback((time: string) => {
      setFormData((prev) => ({ ...prev, start_time: time }));
    }, []);

    const handleEndTimeChange = useCallback((time: string) => {
      setFormData((prev) => ({ ...prev, end_time: time }));
    }, []);

    const handleScoreChange = useCallback((value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        fulfillment_score: value as FulfillmentScore | null,
      }));
    }, []);

    const handleNoteChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, note: value }));
    }, []);

    // 保存ボタンの無効化条件
    const isSaveDisabled = useCallback(() => {
      return !formData.plan_id || formData.duration_minutes <= 0;
    }, [formData.plan_id, formData.duration_minutes]);

    // 保存処理
    const save = useCallback(async () => {
      if (!formData.plan_id || !formData.worked_at) return;

      const workedAtStr = formData.worked_at.toISOString().split('T')[0] ?? '';

      await createRecord.mutateAsync({
        plan_id: formData.plan_id,
        title: formData.title || null,
        worked_at: workedAtStr,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        duration_minutes: formData.duration_minutes,
        fulfillment_score: formData.fulfillment_score,
        note: formData.note || null,
      });

      closeInspector();
    }, [formData, createRecord, closeInspector]);

    // ref 経由で save と isSaveDisabled を公開
    useImperativeHandle(ref, () => ({
      save,
      isSaveDisabled,
    }));

    return (
      <>
        {/* タイトル */}
        <div className="px-4 py-3">
          <input
            type="text"
            value={formData.title}
            placeholder="何をした？"
            onChange={(e) => handleTitleChange(e.target.value)}
            className="placeholder:text-muted-foreground block w-full border-0 bg-transparent text-lg font-bold outline-none"
          />
        </div>

        {/* Plan選択 */}
        <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <ListChecks className="text-muted-foreground size-4" />
          </div>
          <div className="flex h-8 flex-1 items-center">
            <Select value={formData.plan_id ?? ''} onValueChange={handlePlanChange}>
              <SelectTrigger className="h-8 border-0 bg-transparent px-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Planを選択..." />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'size-2 rounded-full',
                          plan.status === 'open' ? 'bg-green-500' : 'bg-gray-400',
                        )}
                      />
                      <span className="truncate">{plan.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 作業日 + 時間 */}
        <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <Calendar className="text-muted-foreground size-4" />
          </div>
          <div className="flex h-8 flex-1 items-center gap-2">
            <DatePickerPopover
              selectedDate={formData.worked_at}
              onDateChange={handleDateChange}
              placeholder="作業日を選択..."
            />
          </div>
        </div>

        {/* 開始・終了時間 */}
        <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <Clock className="text-muted-foreground size-4" />
          </div>
          <div className="flex h-8 flex-1 items-center gap-1">
            <ClockTimePicker value={formData.start_time} onChange={handleStartTimeChange} />
            <span className="text-muted-foreground mx-1">-</span>
            <ClockTimePicker value={formData.end_time} onChange={handleEndTimeChange} />
            {durationDisplay && (
              <span className="text-muted-foreground ml-2 text-sm">{durationDisplay}</span>
            )}
          </div>
        </div>

        {/* 充実度 */}
        <div className="border-border/50 flex min-h-10 items-center gap-2 border-t px-4 py-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <Smile className="text-muted-foreground size-4" />
          </div>
          <div className="flex h-8 flex-1 items-center">
            <StarRating value={formData.fulfillment_score} onChange={handleScoreChange} max={5} />
          </div>
        </div>

        {/* メモ */}
        <div className="border-border/50 flex min-h-10 items-start gap-2 border-t px-4 py-2">
          <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center">
            <FileText className="text-muted-foreground size-4" />
          </div>
          <div className="min-h-8 min-w-0 flex-1">
            <Textarea
              value={formData.note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="メモを追加..."
              className="min-h-16 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              rows={2}
            />
          </div>
        </div>
      </>
    );
  },
);
