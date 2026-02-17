import { createTRPCRouter } from '@/server/api/trpc';

import { chatCrudRouter } from './crud';
import { chatUsageRouter } from './usage';

export const chatRouter = createTRPCRouter({
  list: chatCrudRouter.list,
  getById: chatCrudRouter.getById,
  getMostRecent: chatCrudRouter.getMostRecent,
  create: chatCrudRouter.create,
  save: chatCrudRouter.save,
  delete: chatCrudRouter.delete,
  getUsage: chatUsageRouter.getUsage,
});
