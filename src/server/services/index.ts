/**
 * Server Services Module
 *
 * ビジネスロジックを集約したサービス層のエクスポート
 */

// 共通エラーハンドリング
export { handleServiceError, registerErrorCode, ServiceError } from './errors'

// Plans Service
export { createPlanService, PlanService, PlanServiceError } from './plans'
export type {
  CreatePlanOptions,
  DeletePlanOptions,
  GetPlanByIdOptions,
  ListPlansOptions,
  PlanRow,
  PlanWithTags,
  UpdatePlanOptions,
} from './plans'

// Notifications Service
export { createNotificationService, NotificationService, NotificationServiceError } from './notifications'
export type {
  CreateNotificationOptions,
  DeleteNotificationsOptions,
  ListNotificationsOptions,
  MarkAllAsReadOptions,
  NotificationRow,
  UpdateNotificationOptions,
} from './notifications'
