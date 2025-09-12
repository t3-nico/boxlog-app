import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import type { ToastTemplates } from './types';

export const toastTemplates: ToastTemplates = {
  created: {
    title: '予定を作成しました',
    description: (opts) => opts.event ? 
      `「${opts.event.title}」${format(opts.event.displayStartDate, 'M月d日 HH:mm', { locale: ja })}` : '',
    type: 'success',
    duration: 3000,
  },
  
  updated: {
    title: '予定を更新しました',
    description: (opts) => opts.event?.title || '',
    type: 'success',
    duration: 3000,
  },
  
  deleted: {
    title: '予定を削除しました',
    description: (opts) => opts.event ? `「${opts.event.title}」` : '',
    type: 'success',
    duration: 10000, // アンドゥ可能なら長め
  },
  
  moved: {
    title: '予定を移動しました',
    description: (opts) => {
      if (!opts.event || !opts.toDate) return '';
      return `「${opts.event.title}」を${format(opts.toDate, 'M月d日', { locale: ja })}に移動`;
    },
    type: 'success',
    duration: 3000,
  },
  
  duplicated: {
    title: '予定を複製しました',
    description: (opts) => opts.event?.title || '',
    type: 'success',
    duration: 3000,
  },
  
  'bulk-deleted': {
    title: '複数の予定を削除しました',
    description: (opts) => `${opts.count || 0}件の予定を削除`,
    type: 'success',
    duration: 10000, // アンドゥ可能なら長め
  },
  
  'sync-started': {
    title: 'カレンダーを同期中...',
    type: 'loading',
  },
  
  'sync-completed': {
    title: '同期が完了しました',
    type: 'success',
    duration: 2000,
  },
  
  'sync-failed': {
    title: '同期に失敗しました',
    description: () => 'ネットワーク接続を確認してください',
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