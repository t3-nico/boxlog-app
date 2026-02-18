/**
 * Chat Service
 *
 * AIチャット会話のCRUD操作。
 * メッセージはJSONB配列として1カラムに格納（UIMessage[]互換）。
 */

import { logger } from '@/lib/logger';
import { ServiceError } from '@/server/services/errors';

import type { UIMessage } from 'ai';

import type {
  ConversationRow,
  ConversationSummary,
  CreateConversationOptions,
  DeleteConversationOptions,
  GetConversationOptions,
  ListConversationsOptions,
  ServiceSupabaseClient,
  UpdateConversationOptions,
} from './types';

export class ChatService {
  constructor(private readonly supabase: ServiceSupabaseClient) {}

  /** 会話一覧取得（メッセージ除外） */
  async list(options: ListConversationsOptions): Promise<ConversationSummary[]> {
    const { userId, limit = 20, offset = 0 } = options;

    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('id, title, message_count, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new ChatServiceError('FETCH_FAILED', `Failed to fetch conversations: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      messageCount: row.message_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /** 会話詳細取得（メッセージ含む） */
  async getById(options: GetConversationOptions): Promise<ConversationRow> {
    const { userId, conversationId } = options;

    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new ChatServiceError('NOT_FOUND', `Conversation not found: ${error.message}`);
    }

    return {
      ...data,
      messages: (data.messages ?? []) as unknown as UIMessage[],
    };
  }

  /** 最新会話を1件取得（マウント時の復元用） */
  async getMostRecent(userId: string): Promise<ConversationRow | null> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Failed to fetch recent conversation:', error);
      throw new ChatServiceError(
        'FETCH_FAILED',
        `Failed to fetch recent conversation: ${error.message}`,
      );
    }

    if (!data) return null;

    return {
      ...data,
      messages: (data.messages ?? []) as unknown as UIMessage[],
    };
  }

  /** 新規会話作成 */
  async create(options: CreateConversationOptions): Promise<ConversationRow> {
    const { userId, input } = options;

    const title = input.title ?? this.generateTitle(input.messages);

    const { data, error } = await this.supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title,
        messages: JSON.parse(JSON.stringify(input.messages)),
        message_count: input.messages.length,
      })
      .select()
      .single();

    if (error) {
      throw new ChatServiceError(
        'CREATE_FAILED',
        `Failed to create conversation: ${error.message}`,
      );
    }

    return {
      ...data,
      messages: (data.messages ?? []) as unknown as UIMessage[],
    };
  }

  /** メッセージ保存（更新） */
  async update(options: UpdateConversationOptions): Promise<ConversationRow> {
    const { userId, conversationId, title, messages } = options;

    const updateData: Record<string, unknown> = {
      messages: JSON.parse(JSON.stringify(messages)),
      message_count: messages.length,
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    const { data, error } = await this.supabase
      .from('chat_conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new ChatServiceError(
        'UPDATE_FAILED',
        `Failed to update conversation: ${error.message}`,
      );
    }

    return {
      ...data,
      messages: (data.messages ?? []) as unknown as UIMessage[],
    };
  }

  /** 会話削除 */
  async delete(options: DeleteConversationOptions): Promise<{ success: boolean }> {
    const { userId, conversationId } = options;

    const { error } = await this.supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      throw new ChatServiceError(
        'DELETE_FAILED',
        `Failed to delete conversation: ${error.message}`,
      );
    }

    return { success: true };
  }

  /** 最初のユーザーメッセージからタイトル生成 */
  private generateTitle(messages: UIMessage[]): string {
    const firstUserMessage = messages.find((m) => m.role === 'user');
    if (!firstUserMessage) return 'New conversation';

    const textPart = firstUserMessage.parts.find(
      (p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text',
    );
    if (!textPart) return 'New conversation';

    const text = textPart.text.trim();
    return text.length > 50 ? `${text.slice(0, 47)}...` : text;
  }
}

export class ChatServiceError extends ServiceError {
  constructor(code: string, message: string) {
    super(code, message);
    this.name = 'ChatServiceError';
  }
}

export function createChatService(supabase: ServiceSupabaseClient): ChatService {
  return new ChatService(supabase);
}
