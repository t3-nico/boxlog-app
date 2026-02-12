'use client';

import { memo } from 'react';

import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from '@/components/prompt-kit/chat-container';
import { Message, MessageContent } from '@/components/prompt-kit/message';

import type { ChatMessage } from '../types';

interface ChatMessageListProps {
  messages: ChatMessage[];
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
                  ? 'bg-muted max-w-[85%] rounded-2xl text-sm'
                  : 'max-w-full bg-transparent p-0 text-sm'
              }
            >
              {message.content}
            </MessageContent>
          </Message>
        ))}
        <ChatContainerScrollAnchor />
      </ChatContainerContent>
    </ChatContainerRoot>
  );
});
