import { z } from 'zod';

/**
 * Chat Conversation Schemas
 *
 * UIMessage互換のJSONB永続化用バリデーション。
 * ツール固有フィールドは `.passthrough()` で許可。
 */

// UIMessage.parts の1要素（ツール固有フィールドを許可）
const messagePartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

// UIMessage互換のメッセージスキーマ
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(messagePartSchema).max(100),
});

// 会話作成
export const createConversationSchema = z.object({
  title: z.string().max(200).optional(),
  messages: z.array(chatMessageSchema).max(200).default([]),
});

// 会話メッセージ更新（保存）
export const updateConversationSchema = z.object({
  conversationId: z.string().uuid(),
  title: z.string().max(200).optional(),
  messages: z.array(chatMessageSchema).max(200),
});

// 会話ID
export const conversationIdSchema = z.object({
  conversationId: z.string().uuid(),
});

// 会話一覧フィルター
export const listConversationsSchema = z
  .object({
    limit: z.number().int().min(1).max(50).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .optional();

// 型エクスポート
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ListConversationsInput = z.infer<typeof listConversationsSchema>;
