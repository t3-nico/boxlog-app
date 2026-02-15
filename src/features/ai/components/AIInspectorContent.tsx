'use client';

import { memo, useCallback, useState } from 'react';

import type { ChatMessage } from '../types';

import { DEFAULT_SUGGESTIONS } from './__mocks__/chatMockData';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';

/**
 * AI Chat content for the side panel
 *
 * Composes ChatEmptyState, ChatMessageList, and ChatInput.
 * State is managed locally via useState; will be replaced
 * with useChat() from Vercel AI SDK when backend is integrated.
 */
export const AIInspectorContent = memo(function AIInspectorContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasMessages = messages.length > 0;

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Stub: AI SDK integration will replace this
    // with streaming response via useChat()
    void setIsLoading;
  }, [input]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  const handleStop = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {hasMessages ? (
          <ChatMessageList messages={messages} />
        ) : (
          <ChatEmptyState
            suggestions={DEFAULT_SUGGESTIONS}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </div>
      <ChatInput
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={handleStop}
      />
    </div>
  );
});
