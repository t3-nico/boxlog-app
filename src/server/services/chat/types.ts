/**
 * Chat Service Types
 *
 * チャット会話永続化サービスの型定義
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

import type { UIMessage } from 'ai';

/**
 * サービス関数で使用するSupabaseクライアント型
 */
export type ServiceSupabaseClient = SupabaseClient<Database>;

/** DB行型 */
export interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  messages: UIMessage[];
  message_count: number;
  created_at: string;
  updated_at: string;
}

/** 一覧用サマリー（メッセージ除外） */
export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListConversationsOptions {
  userId: string;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface GetConversationOptions {
  userId: string;
  conversationId: string;
}

export interface CreateConversationOptions {
  userId: string;
  input: {
    title?: string | undefined;
    messages: UIMessage[];
  };
}

export interface UpdateConversationOptions {
  userId: string;
  conversationId: string;
  title?: string | undefined;
  messages: UIMessage[];
}

export interface DeleteConversationOptions {
  userId: string;
  conversationId: string;
}
