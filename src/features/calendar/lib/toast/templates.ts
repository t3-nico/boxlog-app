import { format } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';

import { getTranslation } from './get-translation';
import { CALENDAR_TOAST_KEYS } from './translation-keys';
import type { ToastTemplates } from './types';

// ロケールに応じた date-fns locale を取得
const getDateFnsLocale = (locale: 'ja' | 'en') => (locale === 'ja' ? ja : enUS);

// TODO: 現在はデフォルト'ja'を使用。将来的にはランタイムでロケールを取得する仕組みが必要
const DEFAULT_LOCALE: 'ja' | 'en' = 'ja';

export const toastTemplates: ToastTemplates = {
  created: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_CREATED, DEFAULT_LOCALE),
    description: (opts) => {
      if (!opts.event) return '';
      const dateFormat = getTranslation(CALENDAR_TOAST_KEYS.DATES_FORMAT_DATE_TIME, DEFAULT_LOCALE);
      return `「${opts.event.title}」${format(opts.event.displayStartDate, dateFormat, { locale: getDateFnsLocale(DEFAULT_LOCALE) })}`;
    },
    type: 'success',
    duration: 3000,
  },

  updated: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_UPDATED, DEFAULT_LOCALE),
    description: (opts) => opts.event?.title || '',
    type: 'success',
    duration: 3000,
  },

  deleted: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_DELETED, DEFAULT_LOCALE),
    description: (opts) => (opts.event ? `「${opts.event.title}」` : ''),
    type: 'success',
    duration: 10000, // アンドゥ可能なら長め
  },

  moved: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED, DEFAULT_LOCALE),
    description: (opts) => {
      if (!opts.event || !opts.toDate) return '';
      const dateFormat = getTranslation(CALENDAR_TOAST_KEYS.DATES_FORMAT_MONTH_DAY, DEFAULT_LOCALE);
      return `「${opts.event.title}」${getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED_TO, DEFAULT_LOCALE)}${format(opts.toDate, dateFormat, { locale: getDateFnsLocale(DEFAULT_LOCALE) })}${getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED_TO_SUFFIX, DEFAULT_LOCALE)}`;
    },
    type: 'success',
    duration: 3000,
  },

  duplicated: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_DUPLICATED, DEFAULT_LOCALE),
    description: (opts) => opts.event?.title || '',
    type: 'success',
    duration: 3000,
  },

  'bulk-deleted': {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_BULK_DELETED, DEFAULT_LOCALE),
    description: (opts) =>
      `${opts.count || 0}${getTranslation(CALENDAR_TOAST_KEYS.EVENT_BULK_DELETED_DESC, DEFAULT_LOCALE)}`,
    type: 'success',
    duration: 10000, // アンドゥ可能なら長め
  },

  'sync-started': {
    title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_STARTED, DEFAULT_LOCALE),
    type: 'loading',
  },

  'sync-completed': {
    title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_COMPLETED, DEFAULT_LOCALE),
    type: 'success',
    duration: 2000,
  },

  'sync-failed': {
    title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_FAILED, DEFAULT_LOCALE),
    description: () => getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_FAILED_DESC, DEFAULT_LOCALE),
    type: 'error',
    duration: 5000,
  },
};

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
