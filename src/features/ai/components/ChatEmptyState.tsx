'use client';

import { memo } from 'react';

import { PromptSuggestion } from '@/components/prompt-kit/prompt-suggestion';

interface ChatEmptyStateProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatEmptyState = memo(function ChatEmptyState({
  suggestions,
  onSuggestionClick,
}: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col justify-end px-3 pb-2">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <PromptSuggestion
            key={suggestion}
            className="text-xs"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </PromptSuggestion>
        ))}
      </div>
    </div>
  );
});
