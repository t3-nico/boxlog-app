/**
 * AI Chat Message type
 *
 * Designed for future compatibility with Vercel AI SDK's UIMessage.
 * When integrating AI SDK, map UIMessage.parts[type='text'].text -> content,
 * or switch to UIMessage entirely.
 *
 * @see https://ai-sdk.dev/docs/reference/ai-sdk-core/ui-message
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message sender role */
  role: 'user' | 'assistant';
  /** Plain text content of the message */
  content: string;
  /** Timestamp when the message was created */
  createdAt?: Date;
}
