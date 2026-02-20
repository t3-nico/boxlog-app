'use client';

import { useTranslations } from 'next-intl';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import { SuggestInput } from '@/components/common/SuggestInput';
import { useRecordMutations } from '@/features/records/hooks';
import { computeDuration } from '@/lib/time-utils';
import { api } from '@/lib/trpc';
import {
  FulfillmentButton,
  InspectorDetailsLayout,
  NoteIconButton,
  PlanIconButton,
  ScheduleRow,
  TagsIconButton,
} from '../shared';

import { usePlanInspectorStore } from '../../../stores/usePlanInspectorStore';

import type { FulfillmentScore } from '@/features/records/types/record';

interface RecordFormData {
  title: string;
  plan_id: string | null;
  worked_at: Date | undefined;
  start_time: string;
  end_time: string;
  fulfillment_score: FulfillmentScore | null;
  note: string;
  tagIds: string[];
}

export interface RecordCreateFormRef {
  save: () => void;
  isSaveDisabled: () => boolean;
  focusTitle: () => void;
}

/**
 * Record 作成フォーム（Toggl風3行構造）
 *
 * 1行目: タイトル（大きく）
 * 2行目: 日付 + 時間
 * 3行目: Tags + オプションアイコン（Plan紐付け、充実度、メモ）
 */
export const RecordCreateForm = forwardRef<RecordCreateFormRef>(
  function RecordCreateForm(_props, ref) {
    const t = useTranslations();
    const utils = api.useUtils();
    const draftPlan = usePlanInspectorStore((state) => state.draftPlan);
    const closeInspector = usePlanInspectorStore((state) => state.closeInspector);
    const updateDraft = usePlanInspectorStore((state) => state.updateDraft);

    // 時間重複エラー状態（視覚的フィードバック用）
    const [timeConflictError, setTimeConflictError] = useState(false);

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
      if (draftPlan?.start_time) {
        return new Date(draftPlan.start_time);
      }
      return today;
    }, [draftPlan?.start_time, today]);

    // フォーム状態（draftPlanから初期値を取得）
    const [formData, setFormData] = useState<RecordFormData>({
      title: draftPlan?.title ?? '',
      plan_id: draftPlan?.plan_id ?? null,
      worked_at: initialWorkedAt,
      start_time: initialStartTime,
      end_time: initialEndTime,
      fulfillment_score: null,
      note: draftPlan?.note ?? draftPlan?.description ?? '',
      tagIds: draftPlan?.tagIds ?? [],
    });

    const titleInputRef = useRef<HTMLInputElement>(null);

    // 初期値が変わったら反映
    useEffect(() => {
      setFormData((prev) => ({
        ...prev,
        worked_at: initialWorkedAt,
        start_time: initialStartTime,
        end_time: initialEndTime,
      }));
    }, [initialWorkedAt, initialStartTime, initialEndTime]);

    // フォーム変更ハンドラ
    const handleTitleChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, title: value }));
    }, []);

    const handlePlanChange = useCallback(
      (planId: string | null, plan?: { title: string; tagIds?: string[] }) => {
        setFormData((prev) => ({
          ...prev,
          plan_id: planId,
          // Planのタグを自動プリセット
          ...(plan?.tagIds?.length ? { tagIds: plan.tagIds } : {}),
        }));
        // カレンダープレビュー更新
        updateDraft({ plan_id: planId });
      },
      [updateDraft],
    );

    // 時間をISO文字列に変換するヘルパー
    const buildIsoTime = useCallback((date: Date, time: string): string | null => {
      if (!time) return null;
      const [h, m] = time.split(':').map(Number);
      const result = new Date(date);
      result.setHours(h ?? 0, m ?? 0, 0, 0);
      return result.toISOString();
    }, []);

    const handleDateChange = useCallback(
      (date: Date | undefined) => {
        setFormData((prev) => {
          const newData = { ...prev, worked_at: date };
          // draftPlanも更新（カレンダープレビュー用）
          if (date) {
            updateDraft({
              start_time: buildIsoTime(date, prev.start_time),
              end_time: buildIsoTime(date, prev.end_time),
            });
          }
          return newData;
        });
      },
      [updateDraft, buildIsoTime],
    );

    const handleStartTimeChange = useCallback(
      (time: string) => {
        // 時間変更時にエラーをクリア
        setTimeConflictError(false);
        setFormData((prev) => {
          const newData = { ...prev, start_time: time };
          // draftPlanも更新（カレンダープレビュー用）
          if (prev.worked_at) {
            updateDraft({ start_time: buildIsoTime(prev.worked_at, time) });
          }
          return newData;
        });
      },
      [updateDraft, buildIsoTime],
    );

    const handleEndTimeChange = useCallback(
      (time: string) => {
        // 時間変更時にエラーをクリア
        setTimeConflictError(false);
        setFormData((prev) => {
          const newData = { ...prev, end_time: time };
          // draftPlanも更新（カレンダープレビュー用）
          if (prev.worked_at) {
            updateDraft({ end_time: buildIsoTime(prev.worked_at, time) });
          }
          return newData;
        });
      },
      [updateDraft, buildIsoTime],
    );

    const handleScoreChange = useCallback((value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        fulfillment_score: value as FulfillmentScore | null,
      }));
    }, []);

    const handleNoteChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, note: value }));
    }, []);

    const handleTagsChange = useCallback((tagIds: string[]) => {
      setFormData((prev) => ({ ...prev, tagIds }));
    }, []);

    const handleSuggestionSelect = useCallback((entry: { title: string; tagIds: string[] }) => {
      setFormData((prev) => ({ ...prev, title: entry.title, tagIds: entry.tagIds }));
    }, []);

    // 保存ボタンの無効化条件（時間が必須）
    const isSaveDisabled = useCallback(() => {
      return computeDuration(formData.start_time, formData.end_time) <= 0;
    }, [formData.start_time, formData.end_time]);

    /**
     * Inspectorを即座に閉じ、Record作成はバックグラウンドで実行
     * エラー時はtoastで通知。
     */
    const save = useCallback(() => {
      if (!formData.worked_at) {
        return;
      }

      const workedAtStr = formData.worked_at.toISOString().split('T')[0] ?? '';

      // クライアント側で即時重複チェック（サーバー呼び出し前）
      if (formData.start_time && formData.end_time) {
        const records = utils.records.list.getData();
        if (records && records.length > 0) {
          const [startH, startM] = formData.start_time.split(':').map(Number);
          const [endH, endM] = formData.end_time.split(':').map(Number);
          const newStart = new Date(formData.worked_at);
          newStart.setHours(startH ?? 0, startM ?? 0, 0, 0);
          const newEnd = new Date(formData.worked_at);
          newEnd.setHours(endH ?? 0, endM ?? 0, 0, 0);

          const hasOverlap = records.some((r) => {
            if (r.worked_at !== workedAtStr) return false;
            if (!r.start_time || !r.end_time) return false;

            const [rStartH, rStartM] = r.start_time.split(':').map(Number);
            const [rEndH, rEndM] = r.end_time.split(':').map(Number);
            const rStart = new Date(formData.worked_at!);
            rStart.setHours(rStartH ?? 0, rStartM ?? 0, 0, 0);
            const rEnd = new Date(formData.worked_at!);
            rEnd.setHours(rEndH ?? 0, rEndM ?? 0, 0, 0);

            return rStart < newEnd && rEnd > newStart;
          });

          if (hasOverlap) {
            setTimeConflictError(true);
            return; // 重複があればインラインエラー表示（閉じない）
          }
        }
      }

      // データをキャプチャしてから即座に閉じる
      const saveData = {
        plan_id: formData.plan_id,
        title: formData.title || null,
        worked_at: workedAtStr,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        duration_minutes: computeDuration(formData.start_time, formData.end_time),
        fulfillment_score: formData.fulfillment_score,
        note: formData.note || null,
        tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,
      };

      closeInspector();

      // バックグラウンドで作成
      createRecord.mutateAsync(saveData).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('既にRecord') || errorMessage.includes('TIME_OVERLAP')) {
          toast.error(t('plan.inspector.recordCreate.timeOverlap'));
        } else {
          toast.error(t('plan.inspector.recordCreate.failed'));
        }
      });
    }, [formData, createRecord, closeInspector, utils.records.list, t]);

    // ref 経由で save と isSaveDisabled を公開
    useImperativeHandle(
      ref,
      () => ({
        save,
        isSaveDisabled,
        focusTitle: () => titleInputRef.current?.focus(),
      }),
      [save, isSaveDisabled],
    );

    return (
      <div className="flex flex-col">
        <InspectorDetailsLayout
          title={
            <SuggestInput
              ref={titleInputRef}
              value={formData.title}
              onChange={handleTitleChange}
              onSuggestionSelect={handleSuggestionSelect}
              type="record"
              placeholder={t('plan.inspector.recordCreate.titlePlaceholder')}
              aria-label={t('plan.inspector.recordCreate.titleLabel')}
              autoFocus
            />
          }
          schedule={
            <ScheduleRow
              selectedDate={formData.worked_at}
              startTime={formData.start_time}
              endTime={formData.end_time}
              onDateChange={handleDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              timeConflictError={timeConflictError}
            />
          }
          options={
            <>
              <TagsIconButton
                tagIds={formData.tagIds}
                onTagsChange={handleTagsChange}
                popoverSide="bottom"
              />
              <PlanIconButton planId={formData.plan_id} onPlanChange={handlePlanChange} />
              <FulfillmentButton
                score={formData.fulfillment_score}
                onScoreChange={handleScoreChange}
              />
              <NoteIconButton
                id="draft-record"
                note={formData.note}
                onNoteChange={handleNoteChange}
              />
            </>
          }
        />
      </div>
    );
  },
);
