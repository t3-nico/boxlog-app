/**
 * アプリケーション定数
 */

export const APP_CONFIG = {
  name: 'BoxLog',
  version: '1.0.0',
  description: 'Task and calendar management application',
} as const;

export const LIMITS = {
  maxTasksPerPage: 50,
  maxTagsPerItem: 10,
} as const;

export const TIMEOUTS = {
  apiRequest: 10000, // 10秒
  autoSave: 3000, // 3秒
} as const;
