/**
 * tRPCメインルーター
 * 全APIルーターの統合とエクスポート
 */

import { suggestionsRouter } from '@/features/ai/server/suggestions-router';
import { userRouter } from '@/features/auth/server/router';
import { entriesRouter } from '@/features/entry/server/router-index';
import { emailRouter } from '@/features/notifications/server/email-router';
import { notificationPreferencesRouter } from '@/features/notifications/server/preferences-router';
import { notificationsRouter } from '@/features/notifications/server/router';
import { userSettingsRouter } from '@/features/settings/server/router';
import { tagsRouter } from '@/features/tags/server/router';
import { createTRPCRouter } from '@/platform/trpc/procedures';

/**
 * メインAPIルーター
 */
export const appRouter = createTRPCRouter({
  email: emailRouter,
  entries: entriesRouter,
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
