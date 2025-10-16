/**
 * tRPCメインルーター
 * 全APIルーターの統合とエクスポート
 */

import { profileRouter } from './routers/profile'
import { tasksRouter } from './routers/tasks'
import { createTRPCRouter } from './trpc'

/**
 * メインAPIルーター
 */
export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  profile: profileRouter,
  // 他のルーターをここに追加
  // auth: authRouter,
  // users: usersRouter,
  // projects: projectsRouter,
})

/**
 * AppRouter型のエクスポート
 * クライアント側で型推論に使用
 */
export type AppRouter = typeof appRouter
