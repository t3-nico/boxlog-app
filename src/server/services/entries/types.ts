/**
 * Entries Service Types
 *
 * サービス層で使用する型定義（plans + records 統合後）
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { CreateEntryInput, EntryFilter, UpdateEntryInput } from '@/schemas/entries';

/**
 * サービス関数で使用するSupabaseクライアント型
 */
export type ServiceSupabaseClient = SupabaseClient<Database>;

/**
 * エントリのデータベース行型
 */
export type EntryRow = Database['public']['Tables']['entries']['Row'];

/**
 * エントリタグのデータベース行型
 */
export type EntryTagRow = Database['public']['Tables']['entry_tags']['Row'];

/**
 * タグのデータベース行型
 */
export type TagRow = Database['public']['Tables']['tags']['Row'];

/**
 * エントリ（タグID付き）
 */
export interface EntryWithTags extends EntryRow {
  entry_tags?: Array<{
    tag_id: string;
  }>;
  tagIds?: string[];
}

/**
 * エントリ一覧取得のオプション
 */
export interface ListEntriesOptions extends EntryFilter {
  userId: string;
}

/**
 * エントリ作成のオプション
 */
export interface CreateEntryOptions {
  userId: string;
  input: CreateEntryInput;
  preventOverlappingEntries?: boolean;
}

/**
 * エントリ更新のオプション
 */
export interface UpdateEntryOptions {
  userId: string;
  entryId: string;
  input: UpdateEntryInput;
  preventOverlappingEntries?: boolean;
}

/**
 * エントリ削除のオプション
 */
export interface DeleteEntryOptions {
  userId: string;
  entryId: string;
}

/**
 * エントリ取得のオプション
 */
export interface GetEntryByIdOptions {
  userId: string;
  entryId: string;
  includeTags?: boolean;
}
