import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import { getTranslation } from './get-translation';
import { CALENDAR_TOAST_KEYS } from './translation-keys';
import type { ToastTemplates } from './types';

export const toastTemplates: ToastTemplates = {
  created: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_CREATED),
    description: (opts) => opts.event ?
      `「${opts.event.title}」${format(opts.event.displayStartDate, 'M月d日 HH:mm', { locale: ja })}` : '',
    type: 'success',
    duration: 3000,
  },

  updated: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_UPDATED),
    description: (opts) => opts.event?.title || '',
    type: 'success',
    duration: 3000,
  },

  deleted: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_DELETED),
    description: (opts) => opts.event ? `「${opts.event.title}」` : '',
    type: 'success',
    duration: 10000, // アンドゥ可能なら長め
  },

  moved: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED),
    description: (opts) => {
      if (!opts.event || !opts.toDate) return '';
      return `「${opts.event.title}」${getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED_TO)}${format(opts.toDate, 'M月d日', { locale: ja })}${getTranslation(CALENDAR_TOAST_KEYS.EVENT_MOVED_TO_SUFFIX)}`;
    },
    type: 'success',
    duration: 3000,
  },

  duplicated: {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_DUPLICATED),
    description: (opts) => opts.event?.title || '',
    type: 'success',
    duration: 3000,
  },

  'bulk-deleted': {
    title: getTranslation(CALENDAR_TOAST_KEYS.EVENT_BULK_DELETED),
    description: (opts) => `${opts.count || 0}${getTranslation(CALENDAR_TOAST_KEYS.EVENT_BULK_DELETED_DESC)}`,
    type: 'success',
    duration: 10000, // アンドゥ可能なら長め
  },

  'sync-started': {
    title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_STARTED),
    type: 'loading',
  },

  'sync-completed': {
    title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_COMPLETED),
    type: 'success',
    duration: 2000,
  },

  'sync-failed': {
    title: getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_FAILED),
    description: () => getTranslation(CALENDAR_TOAST_KEYS.TOAST_SYNC_FAILED_DESC),
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