'use client';

import { useCallback, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslations } from 'next-intl';

import { useRecurringEditConfirmStore } from '../stores/useRecurringEditConfirmStore';

/**
 * 繰り返しプラン編集時のスコープ選択
 * - this: このイベントのみ
 * - thisAndFuture: このイベント以降すべて
 * - all: すべてのイベント
 */
export type RecurringEditScope = 'this' | 'thisAndFuture' | 'all';

/**
 * 繰り返しプラン編集確認ダイアログ
 *
 * ReactのcreatePortalを使用してdocument.bodyに直接レンダリング
 * PlanDeleteConfirmDialogと同じパターンで実装
 *
 * Googleカレンダー風のスコープ選択:
 * - このイベントのみ
 * - このイベント以降すべて
 * - すべてのイベント
 *
 * スタイルガイド準拠:
 * - 8pxグリッドシステム（p-6, gap-4, mb-6等）
 * - 角丸: rounded-xl（16px）for ダイアログ
 * - Surface: bg-surface（カード、ダイアログ用）
 */
export function RecurringEditConfirmDialog() {
  const t = useTranslations();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scope, setScope] = useState<RecurringEditScope>('this');

  const isOpen = useRecurringEditConfirmStore((state) => state.isOpen);
  const mode = useRecurringEditConfirmStore((state) => state.mode);
  const onConfirm = useRecurringEditConfirmStore((state) => state.onConfirm);
  const closeDialog = useRecurringEditConfirmStore((state) => state.closeDialog);

  // クライアントサイドでのみマウント
  useEffect(() => {
    setMounted(true);
  }, []);

  // ダイアログが開くたびにscopeをリセット
  useEffect(() => {
    if (isOpen) {
      setScope('this');
    }
  }, [isOpen]);

  // ESCキーでダイアログを閉じる（Inspectorには伝播させない）
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        e.stopPropagation();
        e.preventDefault();
        closeDialog();
      }
    };

    // captureフェーズで処理してInspectorより先にイベントを消費
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, isProcessing, closeDialog]);

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return;
    setIsProcessing(true);
    try {
      await onConfirm(scope);
    } finally {
      setIsProcessing(false);
      closeDialog();
    }
  }, [onConfirm, scope, closeDialog]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Inspectorに伝播させない
      e.stopPropagation();
      if (e.target === e.currentTarget && !isProcessing) {
        closeDialog();
      }
    },
    [isProcessing, closeDialog],
  );

  if (!mounted || !isOpen) return null;

  const isEdit = mode === 'edit';
  const title = t(
    isEdit ? 'common.confirm.recurring.editTitle' : 'common.confirm.recurring.deleteTitle',
  );

  const dialog = (
    <div
      className="animate-in fade-in bg-overlay-heavy fixed inset-0 z-[250] flex items-center justify-center duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recurring-edit-dialog-title"
    >
      <div
        className="animate-in zoom-in-95 fade-in bg-surface text-foreground border-border rounded-xl border p-6 shadow-lg duration-150"
        style={{ width: 'min(calc(100vw - 32px), 360px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 id="recurring-edit-dialog-title" className="mb-6 text-lg font-semibold">
          {title}
        </h2>

        {/* スコープ選択 */}
        <RadioGroup
          value={scope}
          onValueChange={(value) => setScope(value as RecurringEditScope)}
          className="mb-6 space-y-2"
        >
          <label htmlFor="scope-this" className="flex cursor-pointer items-center gap-4">
            <RadioGroupItem value="this" id="scope-this" />
            <span className="text-sm">{t('common.confirm.recurring.thisOnly')}</span>
          </label>
          <label htmlFor="scope-future" className="flex cursor-pointer items-center gap-4">
            <RadioGroupItem value="thisAndFuture" id="scope-future" />
            <span className="text-sm">{t('common.confirm.recurring.thisAndFuture')}</span>
          </label>
          <label htmlFor="scope-all" className="flex cursor-pointer items-center gap-4">
            <RadioGroupItem value="all" id="scope-all" />
            <span className="text-sm">{t('common.confirm.recurring.allEvents')}</span>
          </label>
        </RadioGroup>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
            {t('common.actions.cancel')}
          </Button>
          <Button
            variant={isEdit ? 'primary' : 'destructive'}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing
              ? t('common.form.processing')
              : isEdit
                ? t('common.confirm.recurring.apply')
                : t('common.actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
