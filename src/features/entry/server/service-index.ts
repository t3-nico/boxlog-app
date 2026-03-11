/**
 * Entries Service Module
 *
 * エントリ操作のサービス層エクスポート（plans + records 統合）
 */

export { EntryService, EntryServiceError, createEntryService } from './entry-service';
export type {
  CreateEntryOptions,
  DeleteEntryOptions,
  EntryRow,
  EntryWithTags,
  GetEntryByIdOptions,
  ListEntriesOptions,
  ServiceSupabaseClient,
  UpdateEntryOptions,
} from './types';
