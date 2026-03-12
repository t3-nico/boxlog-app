/**
 * Entries Router
 *
 * Core operations (entries.ts) と Statistics (statistics.ts) を統合。
 */

import { mergeRouters } from '@/platform/trpc/procedures';

import { entriesCoreRouter } from './router';
import { entriesStatisticsRouter } from './statistics';

export const entriesRouter = mergeRouters(entriesCoreRouter, entriesStatisticsRouter);
