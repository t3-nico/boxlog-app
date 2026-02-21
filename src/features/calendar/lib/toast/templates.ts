import { format } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';

import type { Locale } from '@/types/i18n';

import { getTranslation } from './get-translation';
import { CALENDAR_TOAST_KEYS } from './translation-keys';
import type { ToastTemplates } from './types';

// ロケールに応じた date-fns locale を取得
const getDateFnsLocale = (locale: Locale) => (locale === 'ja' ? ja : enUS);

export function createToastTemplates(locale: Locale): ToastTemplates {
  return {
    created: {
      title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_CREATED, locale),
      description: (opts) => {
        if (!opts.event) return '';
        const dateFormat = getTranslation(CALENDAR_TOAST_KEYS.DATES_FORMAT_DATE_TIME, locale);
        return `「${opts.event.title}」${format(opts.event.displayStartDate, dateFormat, { locale: getDateFnsLocale(locale) })}`;
      },
      type: 'success',
      duration: 3000,
    },

    updated: {
      title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_UPDATED, locale),
      description: (opts) => opts.event?.title || '',
      type: 'success',
      duration: 3000,
    },

    deleted: {
      title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_DELETED, locale),
      description: (opts) => (opts.event ? `「${opts.event.title}」` : ''),
      type: 'success',
      duration: 10000, // アンドゥ可能なら長め
    },

    moved: {
      title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED, locale),
      description: (opts) => {
        if (!opts.event || !opts.toDate) return '';
        const dateFormat = getTranslation(CALENDAR_TOAST_KEYS.DATES_FORMAT_MONTH_DAY, locale);
        return `「${opts.event.title}」${getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED_TO, locale)}${format(opts.toDate, dateFormat, { locale: getDateFnsLocale(locale) })}${getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED_TO_SUFFIX, locale)}`;
      },
      type: 'success',
      duration: 3000,
    },

    duplicated: {
      title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_DUPLICATED, locale),
      description: (opts) => opts.event?.title || '',
      type: 'success',
      duration: 3000,
    },

    'bulk-deleted': {
      title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_BULK_DELETED, locale),
      description: (opts) =>
        `${opts.count || 0}${getTranslation(CALENDAR_TOAST_KEYS.EVENT_BULK_DELETED_DESC, locale)}`,
      type: 'success',
      duration: 10000, // アンドゥ可能なら長め
    },

    'sync-started': {
      title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_STARTED, locale),
      type: 'loading',
    },

    'sync-completed': {
      title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_COMPLETED, locale),
      type: 'success',
      duration: 2000,
    },

    'sync-failed': {
      title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_FAILED, locale),
      description: () => getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_FAILED_DESC, locale),
      type: 'error',
      duration: 5000,
    },
  };
}

// アイコンマッピング（オプション）
export const actionIcons = {
  created: 'Plus',
  updated: 'Edit',
  deleted: 'Trash2',
  moved: 'Move',
  duplicated: 'Copy',
  'bulk-deleted': 'Trash2',
  'sync-started': 'RefreshCw',
  'sync-completed': 'Check',
  'sync-failed': 'AlertCircle',
} as const;
