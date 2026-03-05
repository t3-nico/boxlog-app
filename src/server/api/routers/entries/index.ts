/**
 * Entries Router
 *
 * Core operations (entries.ts) と Statistics (statistics.ts) を統合。
 */

import { mergeRouters } from '@/server/api/trpc';

import { entriesCoreRouter } from './entries';
import { entriesStatisticsRouter } from './statistics';

export const entriesRouter = mergeRouters(entriesCoreRouter, entriesStatisticsRouter);
