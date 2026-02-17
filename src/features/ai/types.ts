/**
 * AI Feature Types
 *
 * Vercel AI SDK の UIMessage を統一的な型として使用。
 *
 * @see https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message
 */

import type { UIMessage } from 'ai';

/**
 * チャットメッセージ型
 *
 * Vercel AI SDK の UIMessage をそのまま使用。
 * - id: ユニーク識別子
 * - role: 'user' | 'assistant' | 'system'
 * - parts: 構造化コンテンツ（text, tool-invocation 等）
 * - createdAt: タイムスタンプ
 */
export type ChatMessage = UIMessage;
