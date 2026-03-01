/**
 * tRPCメインルーター
 * 全APIルーターの統合とエクスポート
 */

import { chatRouter } from './routers/chat';
import { emailRouter } from './routers/email';
import { entriesRouter } from './routers/entries';
import { gamificationRouter } from './routers/gamification';
import { notificationPreferencesRouter } from './routers/notificationPreferences';
import { notificationsRouter } from './routers/notifications';
import { plansRouter } from './routers/plans';
import { reflectionsRouter } from './routers/reflections';
import { recordsRouter } from './routers/records';
import { suggestionsRouter } from './routers/suggestions';
import { tagsRouter } from './routers/tags';
import { userRouter } from './routers/user';
import { userSettingsRouter } from './routers/userSettings';
import { createTRPCRouter } from './trpc';

/**
 * メインAPIルーター
 */
export const appRouter = createTRPCRouter({
  chat: chatRouter,
  email: emailRouter,
  entries: entriesRouter,
  gamification: gamificationRouter,
  plans: plansRouter, // 後方互換性（Part Bで削除予定）
  records: recordsRouter, // 後方互換性（Part Bで削除予定）
  reflections: reflectionsRouter,
  suggestions: suggestionsRouter,
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
