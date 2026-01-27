'use client';

import { Calendar, Clock, ListChecks, Smile } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';

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
import { useRecordMutations } from '@/features/records/hooks';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';

interface RecordFormData {
  plan_id: string | null;
  worked_at: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  fulfillment_score: number | null;
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
 */
export const RecordCreateForm = forwardRef<RecordCreateFormRef>(
  function RecordCreateForm(_props, ref) {
    const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
    const closeInspector = usePlanInspectorStore((state) => state.closeInspector);

    // Plan一覧取得
    const { data: plans } = api.plans.list.useQuery({ status: 'open' });

    // Mutations
    const { createRecord } = useRecordMutations();

    // 今日の日付を取得
    const today = useMemo(() => {
      const d = new Date();
      return d.toISOString().split('T')[0] ?? '';
    }, []);

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
      if (!draftPlan?.due_date) return today;
      return draftPlan.due_date;
    }, [draftPlan?.due_date, today]);

    // 初期duration計算
    const initialDuration = useMemo(() => {
      if (!draftPlan?.start_time || !draftPlan?.end_time) return 60;
      const start = new Date(draftPlan.start_time);
      const end = new Date(draftPlan.end_time);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }, [draftPlan?.start_time, draftPlan?.end_time]);

    // フォーム状態
    const [formData, setFormData] = useState<RecordFormData>({
      plan_id: null,
      worked_at: initialWorkedAt,
      start_time: initialStartTime,
      end_time: initialEndTime,
      duration_minutes: initialDuration,
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
        duration_minutes: initialDuration,
      }));
    }, [initialWorkedAt, initialStartTime, initialEndTime, initialDuration]);

    // フォーム変更ハンドラ
    const handleChange = useCallback(
      (field: keyof RecordFormData, value: string | number | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      },
      [],
    );

    // 保存ボタンの無効化条件
    const isSaveDisabled = useCallback(() => {
      return !formData.plan_id || formData.duration_minutes <= 0;
    }, [formData.plan_id, formData.duration_minutes]);

    // 保存処理
    const save = useCallback(async () => {
      if (!formData.plan_id) return;

      await createRecord.mutateAsync({
        plan_id: formData.plan_id,
        worked_at: formData.worked_at,
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
      <div className="space-y-4">
        {/* Plan選択 */}
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-1 text-xs">
            <ListChecks className="size-3" />
            Plan
          </Label>
          <Select
            value={formData.plan_id ?? ''}
            onValueChange={(v) => handleChange('plan_id', v || null)}
          >
            <SelectTrigger>
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
            value={formData.fulfillment_score?.toString() ?? 'none'}
            onValueChange={(v) =>
              handleChange('fulfillment_score', v === 'none' ? null : parseInt(v))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">未設定</SelectItem>
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
            rows={3}
          />
        </div>
      </div>
    );
  },
);
