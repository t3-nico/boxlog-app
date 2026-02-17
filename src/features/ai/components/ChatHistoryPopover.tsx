'use client';

/**
 * ChatHistoryPopover - 会話履歴ドロップダウン
 *
 * ヘッダーの履歴ボタンから開くPopover。過去の会話一覧を表示し、クリックで切替。
 */

import { History, MessageSquare } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import type { ConversationSummary } from '@/server/services/chat/types';

interface ChatHistoryPopoverProps {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  disabled?: boolean;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const ChatHistoryPopover = memo(function ChatHistoryPopover({
  conversations,
  activeConversationId,
  onSelect,
  disabled = false,
}: ChatHistoryPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <HoverTooltip content="Conversation history" disabled={open}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            icon
            disabled={disabled}
            aria-label="Conversation history"
          >
            <History className="size-5" />
          </Button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent align="end" side="bottom" className="w-64 p-1">
        {conversations.length === 0 ? (
          <div className="text-muted-foreground px-3 py-4 text-center text-xs">
            No conversations yet
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                  'hover:bg-state-hover',
                  conv.id === activeConversationId && 'bg-state-selected',
                )}
              >
                <MessageSquare className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-xs font-medium">
                    {conv.title || 'Untitled'}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    {conv.messageCount} messages · {formatRelativeDate(conv.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
