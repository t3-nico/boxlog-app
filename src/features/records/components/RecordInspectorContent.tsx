'use client';

/**
 * Record Inspector コンテンツ
 *
 * Toggl風3行構造:
 * 1行目: タイトル（大きく）
 * 2行目: 日付 + 時間
 * 3行目: Tags + オプションアイコン（Plan紐付け、充実度、メモ）
 *
 * 既存Record編集専用（新規作成はPlanInspectorで行う）
 */

import { Copy, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  FulfillmentButton,
  InspectorDetailsLayout,
  InspectorHeader,
  NoteIconButton,
  PlanIconButton,
  ScheduleRow,
  TagsIconButton,
  TitleInput,
} from '@/features/plans/components/inspector/shared';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useSubmitShortcut } from '@/hooks/useSubmitShortcut';
import { useUpdateEntityTagsInCache } from '@/hooks/useUpdateEntityTagsInCache';
import { computeDuration } from '@/lib/time-utils';

import {
  useRecord,
  useRecordInspectorNavigation,
  useRecordMutations,
  useRecordTags,
} from '../hooks';
import { useRecordInspectorStore } from '../stores';

import { RecordActivityPopover } from './ActivityPopover';

import type { FulfillmentScore } from '../types/record';

interface FormData {
  title: string;
  plan_id: string | null;
  worked_at: Date | undefined;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  fulfillment_score: FulfillmentScore | null;
  description: string;
  tagIds: string[];
}

interface RecordInspectorContentProps {
  onClose: () => void;
}

/**
 * 時刻文字列から秒を除去（HH:MM:SS → HH:MM）
 */
function formatTimeWithoutSeconds(time: string | null | undefined): string {
  if (!time) return '';
  // "09:00:00" -> "09:00"
  return time.substring(0, 5);
}

export function RecordInspectorContent({ onClose }: RecordInspectorContentProps) {
  const t = useTranslations();
  const updateTagsInCache = useUpdateEntityTagsInCache('records');
  const selectedRecordId = useRecordInspectorStore((state) => state.selectedRecordId);
  const closeRecordInspector = useRecordInspectorStore((state) => state.closeInspector);
  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  // 時間重複エラー状態
  const [timeConflictError, setTimeConflictError] = useState(false);

  // 自動保存デバウンス用タイマー（Activityノイズ防止）
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 元のタグID（キャンセル時のロールバック用）
  const originalTagIdsRef = useRef<string[]>([]);
  // タグが変更されたかどうか
  const [hasTagChanges, setHasTagChanges] = useState(false);

  // Record取得
  // placeholderDataでrecords.listキャッシュから即座に表示（UX向上）
  const { data: record, isLoading } = useRecord(selectedRecordId!, {
    includePlan: true,
    enabled: !!selectedRecordId,
  });

  // Mutations
  const { updateRecord, deleteRecord } = useRecordMutations();
  const { setRecordTags } = useRecordTags();

  // ナビゲーション（前後のRecord移動）
  const { hasPrevious, hasNext, goToPrevious, goToNext } =
    useRecordInspectorNavigation(selectedRecordId);

  // 今日の日付
  const today = useMemo(() => new Date(), []);

  // フォーム状態
  const [formData, setFormData] = useState<FormData>({
    title: '',
    plan_id: null,
    worked_at: today,
    start_time: '',
    end_time: '',
    duration_minutes: 0,
    fulfillment_score: null,
    description: '',
    tagIds: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const isSaving = false;

  // タイトル入力のref
  const titleRef = useRef<HTMLInputElement>(null);

  // Duration計算（派生状態: 時間変更時に自動再計算）
  const durationMinutes = useMemo(
    () => computeDuration(formData.start_time, formData.end_time),
    [formData.start_time, formData.end_time],
  );

  // Recordデータを編集フォームに反映
  useEffect(() => {
    if (record) {
      const workedAtDate = record.worked_at ? new Date(record.worked_at) : today;
      setFormData({
        title: record.title ?? '',
        plan_id: record.plan_id,
        worked_at: workedAtDate,
        start_time: formatTimeWithoutSeconds(record.start_time),
        end_time: formatTimeWithoutSeconds(record.end_time),
        duration_minutes: record.duration_minutes,
        fulfillment_score: record.fulfillment_score as FulfillmentScore | null,
        description: record.description ?? '',
        tagIds: record.tagIds ?? [],
      });
      setIsDirty(false);
      // 元のタグを保存（キャンセル時のロールバック用）
      originalTagIdsRef.current = record.tagIds ?? [];
      setHasTagChanges(false);
    }
  }, [record, today]);

  // 自動保存タイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // TitleInputの自動フォーカストリガー用のキー
  const autoFocusKey = selectedRecordId ?? '';

  // フォーム変更ハンドラ
  const handleTitleChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, title: value }));
      setIsDirty(true);
      if (selectedRecordId) {
        // デバウンス適用してDB保存（Activityノイズ防止）
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updateRecord.mutate({ id: selectedRecordId, data: { title: value || null } });
        }, 500);
      }
    },
    [selectedRecordId, updateRecord],
  );

  const handlePlanChange = useCallback(
    (planId: string | null, plan?: { title: string; tagIds?: string[] }) => {
      setFormData((prev) => {
        const updates: Partial<FormData> = { plan_id: planId };

        // Planのタイトル・タグを自動プリセット
        if (plan) {
          if (!prev.title) {
            updates.title = plan.title;
          }
          if (plan.tagIds && plan.tagIds.length > 0) {
            updates.tagIds = plan.tagIds;
          }
        }

        return { ...prev, ...updates };
      });
      setIsDirty(true);

      if (selectedRecordId) {
        // plan_id変更を即座にDB保存
        updateRecord.mutate({ id: selectedRecordId, data: { plan_id: planId } });
      }
    },
    [selectedRecordId, updateRecord],
  );

  const handleDateChange = useCallback((date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, worked_at: date }));
    setIsDirty(true);
  }, []);

  const handleStartTimeChange = useCallback((time: string) => {
    setTimeConflictError(false);
    setFormData((prev) => ({ ...prev, start_time: time }));
    setIsDirty(true);
  }, []);

  const handleEndTimeChange = useCallback((time: string) => {
    setTimeConflictError(false);
    setFormData((prev) => ({ ...prev, end_time: time }));
    setIsDirty(true);
  }, []);

  const handleScoreChange = useCallback(
    (value: number | null) => {
      setFormData((prev) => ({
        ...prev,
        fulfillment_score: value as FulfillmentScore | null,
      }));
      setIsDirty(true);
      if (selectedRecordId) {
        // 即座にDB保存
        updateRecord.mutate({ id: selectedRecordId, data: { fulfillment_score: value } });
      }
    },
    [selectedRecordId, updateRecord],
  );

  const handleNoteChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, description: value }));
      setIsDirty(true);
      if (selectedRecordId) {
        // デバウンス適用してDB保存（Activityノイズ防止）
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
        autoSaveTimerRef.current = setTimeout(() => {
          updateRecord.mutate({ id: selectedRecordId, data: { description: value || null } });
        }, 500);
      }
    },
    [selectedRecordId, updateRecord],
  );

  const handleTagsChange = useCallback(
    (newTagIds: string[]) => {
      setFormData((prev) => ({ ...prev, tagIds: newTagIds }));
      setIsDirty(true);

      if (selectedRecordId) {
        // 楽観的更新: キャッシュを即座に更新（カレンダーカードに反映）
        updateTagsInCache(selectedRecordId, newTagIds);
        setHasTagChanges(true);
      }
    },
    [selectedRecordId, updateTagsInCache],
  );

  // 複製
  const handleDuplicate = useCallback(() => {
    if (!record) return;

    closeRecordInspector();

    setTimeout(() => {
      openInspectorWithDraft(
        {
          title: `${record.title ?? ''} (copy)`,
          start_time: record.start_time
            ? (() => {
                const [h, m] = record.start_time.split(':').map(Number);
                const d = new Date(formData.worked_at ?? new Date());
                d.setHours(h ?? 0, m ?? 0, 0, 0);
                return d.toISOString();
              })()
            : null,
          end_time: record.end_time
            ? (() => {
                const [h, m] = record.end_time.split(':').map(Number);
                const d = new Date(formData.worked_at ?? new Date());
                d.setHours(h ?? 0, m ?? 0, 0, 0);
                return d.toISOString();
              })()
            : null,
          tagIds: formData.tagIds,
          description: formData.description || null,
        },
        'record',
      );
    }, 100);
  }, [
    record,
    formData.worked_at,
    formData.tagIds,
    formData.description,
    closeRecordInspector,
    openInspectorWithDraft,
  ]);

  // IDをコピー
  const handleCopyId = useCallback(() => {
    if (selectedRecordId) navigator.clipboard.writeText(selectedRecordId);
  }, [selectedRecordId]);

  // 削除
  const handleDelete = async () => {
    if (!selectedRecordId) return;
    if (!window.confirm(t('record.inspector.deleteConfirm'))) return;

    await deleteRecord.mutateAsync({ id: selectedRecordId });
    onClose();
  };

  /**
   * Inspectorを即座に閉じ、保存処理はバックグラウンドで実行
   *
   * 楽観的更新でキャッシュは反映済みのため、サーバー応答を待たずに閉じる。
   * エラー時はtoastで通知。
   */
  const saveAndClose = useCallback(() => {
    if (!selectedRecordId || !formData.worked_at) {
      onClose();
      return;
    }

    // 閉じる前にデータをキャプチャ
    const recordId = selectedRecordId;
    const workedAtStr = formData.worked_at.toISOString().split('T')[0] ?? '';
    const currentIsDirty = isDirty;
    const currentHasTagChanges = hasTagChanges;
    const saveData = {
      worked_at: workedAtStr,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      duration_minutes: durationMinutes,
    };
    const tagIds = [...formData.tagIds];

    // 即座に閉じる
    onClose();

    // バックグラウンドで保存
    if (currentIsDirty) {
      updateRecord.mutateAsync({ id: recordId, data: saveData }).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('TIME_OVERLAP') || errorMessage.includes('既に')) {
          toast.error(t('record.inspector.toast.timeOverlap'));
        } else {
          toast.error(t('record.inspector.toast.saveFailed'));
        }
      });
    }

    if (currentHasTagChanges) {
      setRecordTags(recordId, tagIds).catch(() => {
        toast.error(t('record.inspector.toast.tagsSaveFailed'));
        updateTagsInCache(recordId, originalTagIdsRef.current);
      });
    }
  }, [
    selectedRecordId,
    formData.worked_at,
    formData.start_time,
    formData.end_time,
    durationMinutes,
    formData.tagIds,
    isDirty,
    hasTagChanges,
    updateRecord,
    setRecordTags,
    updateTagsInCache,
    onClose,
    t,
  ]);

  // Cmd+Enter / Ctrl+Enter で保存して閉じる
  useSubmitShortcut({
    enabled: !!selectedRecordId && !isLoading,
    isLoading: isSaving,
    onSubmit: saveAndClose,
  });

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  // Record未取得
  if (!record) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('record.inspector.notFound')}</p>
      </div>
    );
  }

  // メニューコンテンツ
  const menuContent = (
    <>
      <DropdownMenuItem onClick={handleDuplicate}>
        <Copy className="size-4" />
        {t('plan.inspector.menu.duplicate')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleCopyId}>
        <Copy className="size-4" />
        {t('plan.inspector.menu.copyId')}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleDelete} variant="destructive">
        <Trash2 className="size-4" />
        {t('common.actions.delete')}
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ヘッダー（自動保存: ×で閉じる時に時間・タグを保存） */}
      <InspectorHeader
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onClose={isSaving ? () => {} : saveAndClose}
        onPrevious={goToPrevious}
        onNext={goToNext}
        closeLabel={t('common.actions.close')}
        previousLabel={t('common.aria.previous')}
        nextLabel={t('common.aria.next')}
        extraRightContent={
          selectedRecordId ? <RecordActivityPopover recordId={selectedRecordId} /> : undefined
        }
        menuContent={menuContent}
      />

      {/* コンテンツ部分（Toggl風3行構造） */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <InspectorDetailsLayout
          title={
            <TitleInput
              key={autoFocusKey}
              ref={titleRef}
              value={formData.title}
              onChange={handleTitleChange}
              placeholder={t('calendar.event.noTitle')}
              aria-label={t('plan.inspector.recordCreate.titleLabel')}
              autoFocus
              selectOnFocus
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
              <PlanIconButton
                planId={formData.plan_id}
                onPlanChange={handlePlanChange}
                recordId={selectedRecordId}
                onBeforeCreatePlan={closeRecordInspector}
              />
              <FulfillmentButton
                score={formData.fulfillment_score}
                onScoreChange={handleScoreChange}
              />
              <NoteIconButton
                id={selectedRecordId ?? 'record'}
                note={formData.description}
                onNoteChange={handleNoteChange}
              />
            </>
          }
        />
      </div>
    </div>
  );
}
