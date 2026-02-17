'use client';

/**
 * ChatMessageList - メッセージ一覧表示
 *
 * User: プレーンテキストバブル
 * Assistant: Markdownレンダリング + ツール呼び出しステータス + コピーボタン
 */

import { Check, Copy } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { MarkdownContent } from './MarkdownContent';
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from './prompt-kit/chat-container';
import { Message, MessageAction, MessageActions, MessageContent } from './prompt-kit/message';
import { ToolInvocationStatus } from './ToolInvocationStatus';

import type { UIMessage } from 'ai';

import { isToolPart } from '../lib/toolPartHelpers';

interface ChatMessageListProps {
  messages: UIMessage[];
}

/**
 * Userメッセージからテキストを抽出
 */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/**
 * Assistantメッセージのテキストパートのみを連結（コピー用）
 */
function getAssistantText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n\n');
}

/**
 * コピーボタン（2秒間チェックアイコン表示）
 */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [text]);

  return (
    <MessageActions className="mt-1 opacity-0 transition-opacity group-hover/assistant:opacity-100">
      <MessageAction tooltip={copied ? 'Copied!' : 'Copy'}>
        <Button
          variant="ghost"
          size="sm"
          icon
          className="size-7"
          onClick={handleCopy}
          aria-label="Copy message"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </MessageAction>
    </MessageActions>
  );
}

export const ChatMessageList = memo(function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <ChatContainerRoot className="h-full">
      <ChatContainerContent className="space-y-4 p-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            className={message.role === 'user' ? 'justify-end' : 'group/assistant justify-start'}
          >
            {message.role === 'user' ? (
              <MessageContent className="bg-primary text-primary-foreground max-w-[85%] rounded-lg px-4 py-2.5 text-sm">
                {getMessageText(message)}
              </MessageContent>
            ) : (
              <div className="max-w-full">
                <MessageContent className="max-w-full bg-transparent p-0 text-sm">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return <MarkdownContent key={`${message.id}-${index}`} content={part.text} />;
                    }
                    if (isToolPart(part)) {
                      return <ToolInvocationStatus key={`${message.id}-${index}`} part={part} />;
                    }
                    return null;
                  })}
                </MessageContent>
                <CopyButton text={getAssistantText(message)} />
              </div>
            )}
          </Message>
        ))}
        <ChatContainerScrollAnchor />
      </ChatContainerContent>
    </ChatContainerRoot>
  );
});
