'use client';

import { memo } from 'react';

import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from './prompt-kit/chat-container';
import { Message, MessageContent } from './prompt-kit/message';

import type { UIMessage } from 'ai';

interface ChatMessageListProps {
  messages: UIMessage[];
}

/**
 * メッセージからテキストコンテンツを抽出
 *
 * Vercel AI SDK v6 の UIMessage.parts からテキストを取得。
 */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export const ChatMessageList = memo(function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <ChatContainerRoot className="h-full">
      <ChatContainerContent className="space-y-4 p-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            className={message.role === 'user' ? 'justify-end' : 'justify-start'}
          >
            <MessageContent
              className={
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground max-w-[85%] rounded-lg px-4 py-2.5 text-sm'
                  : 'max-w-full bg-transparent p-0 text-sm'
              }
            >
              {getMessageText(message)}
            </MessageContent>
          </Message>
        ))}
        <ChatContainerScrollAnchor />
      </ChatContainerContent>
    </ChatContainerRoot>
  );
});
