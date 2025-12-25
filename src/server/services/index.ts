/**
 * Server Services Module
 *
 * ビジネスロジックを集約したサービス層のエクスポート
 */

// 共通エラーハンドリング
export { ServiceError, handleServiceError, registerErrorCode } from './errors';

// Plans Service
export { PlanService, PlanServiceError, createPlanService } from './plans';
export type {
  CreatePlanOptions,
  DeletePlanOptions,
  GetPlanByIdOptions,
  ListPlansOptions,
  PlanRow,
  PlanWithTags,
  UpdatePlanOptions,
} from './plans';

// Notifications Service
export {
  NotificationService,
  NotificationServiceError,
  createNotificationService,
} from './notifications';
export type {
  CreateNotificationOptions,
  DeleteNotificationsOptions,
  ListNotificationsOptions,
  MarkAllAsReadOptions,
  NotificationRow,
  UpdateNotificationOptions,
} from './notifications';
