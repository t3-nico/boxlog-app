/**
 * Calendar Toast Translation Keys
 *
 * Non-Client Componentsで使用する翻訳キーの定数定義
 * 各キーは src/lib/i18n/dictionaries/*.json に対応
 */

export const CALENDAR_TOAST_KEYS = {
  // Event operations
  EVENT_MOVED: 'calendar.event.moved',
  EVENT_RESIZED: 'calendar.event.resized',
  EVENT_SAVED: 'calendar.event.saved',
  EVENT_CREATED: 'calendar.event.created',
  EVENT_UPDATED: 'calendar.event.updated',
  EVENT_DELETED: 'calendar.event.deleted',
  EVENT_DUPLICATED: 'calendar.event.duplicated',
  EVENT_BULK_DELETED: 'calendar.event.bulkDeleted',
  EVENT_BULK_DELETED_DESC: 'calendar.event.bulkDeletedDesc',
  EVENT_MOVED_TO: 'calendar.event.movedTo',
  EVENT_MOVED_TO_SUFFIX: 'calendar.event.movedToSuffix',

  // Toast messages
  TOAST_MOVED: 'calendar.toast.moved',
  TOAST_RESIZED: 'calendar.toast.resized',
  TOAST_CREATED: 'calendar.toast.created',
  TOAST_UPDATED: 'calendar.toast.updated',
  TOAST_DELETED: 'calendar.toast.deleted',
  TOAST_SAVING: 'calendar.toast.saving',
  TOAST_ERROR: 'calendar.toast.error',
  TOAST_OFFLINE: 'calendar.toast.offline',
  TOAST_OFFLINE_DESC: 'calendar.toast.offlineDesc',
  TOAST_TIMEOUT_TITLE: 'calendar.toast.timeoutTitle',
  TOAST_TIMEOUT_DESC: 'calendar.toast.timeoutDesc',
  TOAST_AUTH_ERROR_TITLE: 'calendar.toast.authErrorTitle',
  TOAST_AUTH_ERROR_DESC: 'calendar.toast.authErrorDesc',
  TOAST_ACCESS_DENIED_TITLE: 'calendar.toast.accessDeniedTitle',
  TOAST_ACCESS_DENIED_DESC: 'calendar.toast.accessDeniedDesc',
  TOAST_NOT_FOUND_TITLE: 'calendar.toast.notFoundTitle',
  TOAST_NOT_FOUND_DESC: 'calendar.toast.notFoundDesc',
  TOAST_CONFLICT_TITLE: 'calendar.toast.conflictTitle',
  TOAST_CONFLICT_DESC: 'calendar.toast.conflictDesc',
  TOAST_SERVER_ERROR_TITLE: 'calendar.toast.serverErrorTitle',
  TOAST_SERVER_ERROR_DESC: 'calendar.toast.serverErrorDesc',
  TOAST_UNKNOWN_ERROR_TITLE: 'calendar.toast.unknownErrorTitle',
  TOAST_UNKNOWN_ERROR_DESC: 'calendar.toast.unknownErrorDesc',
  TOAST_PERMISSION_ERROR_TITLE: 'calendar.toast.permissionErrorTitle',
  TOAST_PERMISSION_ERROR_DESC: 'calendar.toast.permissionErrorDesc',
  TOAST_VALIDATION_ERROR_TITLE: 'calendar.toast.validationErrorTitle',
  TOAST_OPERATION_IN_PROGRESS: 'calendar.toast.operationInProgress',
  TOAST_OPERATION_FAILED: 'calendar.toast.operationFailed',
  TOAST_OPERATION: 'calendar.toast.operation',
  TOAST_SYNC_STARTED: 'calendar.toast.syncStarted',
  TOAST_SYNC_COMPLETED: 'calendar.toast.syncCompleted',
  TOAST_SYNC_FAILED: 'calendar.toast.syncFailed',
  TOAST_SYNC_FAILED_DESC: 'calendar.toast.syncFailedDesc',
  TOAST_UNDO: 'calendar.toast.undo',
  TOAST_UNDO_COMPLETED: 'calendar.toast.undoCompleted',
  TOAST_VIEW: 'calendar.toast.view',
  TOAST_RETRY: 'calendar.toast.retry',
  TOAST_PROCESSING: 'calendar.toast.processing',
  TOAST_SUCCESS: 'calendar.toast.success',
  TOAST_ERROR_OCCURRED: 'calendar.toast.errorOccurred',

  // Network errors
  ERROR_UNAUTHORIZED: 'calendar.errors.unauthorized',
  ERROR_FORBIDDEN: 'calendar.errors.forbidden',
  ERROR_NOT_FOUND: 'calendar.errors.notFound',
  ERROR_CONFLICT: 'calendar.errors.conflict',
  ERROR_SERVER_ERROR: 'calendar.errors.serverError',
  ERROR_OFFLINE: 'calendar.errors.offline',
  ERROR_TIMEOUT: 'calendar.errors.timeout',
  ERROR_UNEXPECTED: 'calendar.errors.unexpected',
} as const

export type CalendarToastKey = (typeof CALENDAR_TOAST_KEYS)[keyof typeof CALENDAR_TOAST_KEYS]
