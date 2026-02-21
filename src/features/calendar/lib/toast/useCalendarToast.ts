import { useCallback, useMemo } from 'react';

import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import type { CalendarPlan } from '@/features/calendar/types';
import type { Locale } from '@/types/i18n';

import { getTranslation } from './get-translation';
import { createToastTemplates } from './templates';
import { CALENDAR_TOAST_KEYS } from './translation-keys';
import type { CalendarAction, CalendarToastOptions } from './types';

export const useCalendarToast = () => {
  const locale = useLocale() as Locale;
  const templates = useMemo(() => createToastTemplates(locale), [locale]);

  // 汎用的なtoast表示関数
  const showCalendarToast = useCallback(
    (action: CalendarAction, options: CalendarToastOptions = {}) => {
      const template = templates[action];
      const description = template.description?.(options);

      // durationを取得（numberまたはundefined）
      const duration = template.duration;

      // アクションボタンの構築
      const actions: Array<{ label: string; onClick: () => void }> = [];

      if (options.undoAction) {
        actions.push({
          label: getTranslation(CALENDAR_TOAST_KEYS.TOAST_UNDO, locale),
          onClick: () => {
            options.undoAction!();
            toast.success(getTranslation(CALENDAR_TOAST_KEYS.TOAST_UNDO_COMPLETED, locale));
          },
        });
      }

      if (options.viewAction) {
        actions.push({
          label: getTranslation(CALENDAR_TOAST_KEYS.TOAST_VIEW, locale),
          onClick: options.viewAction,
        });
      }

      if (options.retryAction) {
        actions.push({
          label: getTranslation(CALENDAR_TOAST_KEYS.TOAST_RETRY, locale),
          onClick: options.retryAction,
        });
      }

      // 既存のtoastシステムを使用
      const toastOptions: Record<string, unknown> = {};

      if (description !== undefined) {
        toastOptions.description = description;
      }
      if (duration !== undefined) {
        toastOptions.duration = duration;
      }
      if (actions.length > 0) {
        toastOptions.action = {
          label: actions[0]!.label,
          onClick: actions[0]!.onClick,
        };
      }

      const toastId = toast[template.type](template.title, toastOptions);

      return toastId;
    },
    [templates, locale],
  );

  // 便利なショートカット関数
  const eventCreated = useCallback(
    (plan: CalendarPlan, options?: CalendarToastOptions) => {
      return showCalendarToast('created', { event: plan, ...options });
    },
    [showCalendarToast],
  );

  const eventUpdated = useCallback(
    (plan: CalendarPlan, options?: CalendarToastOptions) => {
      return showCalendarToast('updated', { event: plan, ...options });
    },
    [showCalendarToast],
  );

  const eventDeleted = useCallback(
    (plan: CalendarPlan, undoAction?: () => void) => {
      return showCalendarToast('deleted', { event: plan, undoAction: undoAction ?? undefined });
    },
    [showCalendarToast],
  );

  const eventMoved = useCallback(
    (plan: CalendarPlan, toDate: Date, options?: CalendarToastOptions) => {
      return showCalendarToast('moved', { event: plan, toDate, ...options });
    },
    [showCalendarToast],
  );

  const bulkDeleted = useCallback(
    (count: number, undoAction?: () => void) => {
      return showCalendarToast('bulk-deleted', { count, undoAction: undoAction ?? undefined });
    },
    [showCalendarToast],
  );

  // 同期関連
  const syncStart = useCallback(() => {
    return showCalendarToast('sync-started');
  }, [showCalendarToast]);

  const syncComplete = useCallback(() => {
    return showCalendarToast('sync-completed');
  }, [showCalendarToast]);

  const syncFailed = useCallback(
    (retryAction?: () => void) => {
      return showCalendarToast('sync-failed', { retryAction: retryAction ?? undefined });
    },
    [showCalendarToast],
  );

  // Promise対応（既存のuseToastから）
  const promise = useCallback(
    async <T>(
      promise: Promise<T>,
      messages: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: Error) => string);
      },
    ) => {
      const id = toast.loading(
        messages.loading || getTranslation(CALENDAR_TOAST_KEYS.TOAST_PROCESSING, locale),
      );

      try {
        const result = await promise;
        toast.dismiss(id);
        toast.success(
          typeof messages.success === 'function'
            ? messages.success(result)
            : messages.success || getTranslation(CALENDAR_TOAST_KEYS.TOAST_SUCCESS, locale),
        );
        return result;
      } catch (error) {
        toast.dismiss(id);
        const errorObject = error instanceof Error ? error : new Error(String(error));
        toast.error(
          typeof messages.error === 'function'
            ? messages.error(errorObject)
            : messages.error || getTranslation(CALENDAR_TOAST_KEYS.TOAST_ERROR_OCCURRED, locale),
        );
        throw error;
      }
    },
    [locale],
  );

  return {
    // 汎用関数
    show: showCalendarToast,
    promise,

    // Calendar特化関数
    eventCreated,
    eventUpdated,
    eventDeleted,
    eventMoved,
    bulkDeleted,
    syncStart,
    syncComplete,
    syncFailed,

    // 既存のtoast関数も露出
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    loading: toast.loading,
    dismiss: toast.dismiss,
  };
};
