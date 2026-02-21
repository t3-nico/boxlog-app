/**
 * tRPCメインルーター
 * 全APIルーターの統合とエクスポート
 */

import { chatRouter } from './routers/chat';
import { notificationPreferencesRouter } from './routers/notificationPreferences';
import { notificationsRouter } from './routers/notifications';
import { plansRouter } from './routers/plans';
import { recordsRouter } from './routers/records';
import { suggestionsRouter } from './routers/suggestions';
import { tagsRouter } from './routers/tags';
import { templatesRouter } from './routers/templates';
import { userRouter } from './routers/user';
import { userSettingsRouter } from './routers/userSettings';
import { createTRPCRouter } from './trpc';

/**
 * メインAPIルーター
 */
export const appRouter = createTRPCRouter({
  chat: chatRouter,
  plans: plansRouter,
  records: recordsRouter,
  suggestions: suggestionsRouter,
  tags: tagsRouter,
  templates: templatesRouter,
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
