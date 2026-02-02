/**
 * Records Router
 *
 * Record（作業ログ）関連のtRPCルーターを集約
 */

import { createTRPCRouter } from '@/server/api/trpc';

import { recordActivitiesRouter } from './activities';
import { recordsCrudRouter } from './crud';
import { recordTagsRouter } from './tags';

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

  // タグ操作
  addTag: recordTagsRouter.addTag,
  removeTag: recordTagsRouter.removeTag,
  setTags: recordTagsRouter.setTags,

  // アクティビティ
  activities: recordActivitiesRouter.list,
});
