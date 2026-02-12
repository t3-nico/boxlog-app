'use client';

import { ArrowUp, Square } from 'lucide-react';
import { memo } from 'react';

import { Button } from '@/components/ui/button';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from './prompt-kit/prompt-input';

interface ChatInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  onStop?: () => void;
}

export const ChatInput = memo(function ChatInput({
  value,
  onValueChange,
  onSubmit,
  isLoading = false,
  onStop,
}: ChatInputProps) {
  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit();
  };

  return (
    <div className="p-4">
      <PromptInput
        value={value}
        onValueChange={onValueChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        maxHeight={120}
      >
        <PromptInputTextarea placeholder="Send a message..." />
        <PromptInputActions className="justify-end pt-1">
          <PromptInputAction tooltip={isLoading ? 'Stop generation' : 'Send message'}>
            <Button
              variant="primary"
              icon
              size="sm"
              className="rounded-full"
              onClick={isLoading ? onStop : handleSubmit}
              disabled={!isLoading && !value.trim()}
              aria-label={isLoading ? 'Stop generation' : 'Send message'}
            >
              {isLoading ? (
                <Square className="size-3 fill-current" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
});
