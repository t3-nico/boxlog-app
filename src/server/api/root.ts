/**
 * tRPCメインルーター
 * 全APIルーターの統合とエクスポート
 */

import { authRouter } from './routers/auth';
import { notificationsRouter } from './routers/notifications';
import { plansRouter } from './routers/plans';
import { profileRouter } from './routers/profile';
import { tagsRouter } from './routers/tags';
import { userSettingsRouter } from './routers/userSettings';
import { createTRPCRouter } from './trpc';

/**
 * メインAPIルーター
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  profile: profileRouter,
  plans: plansRouter,
  tags: tagsRouter,
  notifications: notificationsRouter,
  userSettings: userSettingsRouter,
});

/**
 * AppRouter型のエクスポート
 * クライアント側で型推論に使用
 */
export type AppRouter = typeof appRouter;
