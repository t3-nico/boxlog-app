/**
 * tRPCメインルーター
 * 全APIルーターの統合とエクスポート
 */

import { authRouter } from './routers/auth';
import { notificationPreferencesRouter } from './routers/notificationPreferences';
import { notificationsRouter } from './routers/notifications';
import { plansRouter } from './routers/plans';
import { profileRouter } from './routers/profile';
import { recordsRouter } from './routers/records';
import { tagsRouter } from './routers/tags';
import { userRouter } from './routers/user';
import { userSettingsRouter } from './routers/userSettings';
import { createTRPCRouter } from './trpc';

/**
 * メインAPIルーター
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  profile: profileRouter,
  plans: plansRouter,
  records: recordsRouter,
  tags: tagsRouter,
  user: userRouter,
  notifications: notificationsRouter,
  notificationPreferences: notificationPreferencesRouter,
  userSettings: userSettingsRouter,
});

/**
 * AppRouter型のエクスポート
 * クライアント側で型推論に使用
 */
export type AppRouter = typeof appRouter;
