/**
 * Records Router
 *
 * Record（作業ログ）関連のtRPCルーターを集約
 */

import { createTRPCRouter } from '@/server/api/trpc';

import { recordsCrudRouter } from './crud';

export const recordsRouter = createTRPCRouter({
  // CRUD操作
  list: recordsCrudRouter.list,
  getById: recordsCrudRouter.getById,
  create: recordsCrudRouter.create,
  update: recordsCrudRouter.update,
  delete: recordsCrudRouter.delete,
  duplicate: recordsCrudRouter.duplicate,
  getRecent: recordsCrudRouter.getRecent,
  listByPlan: recordsCrudRouter.listByPlan,
  bulkDelete: recordsCrudRouter.bulkDelete,
});
