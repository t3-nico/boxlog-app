'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarDays, X } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

import { MiniCalendar } from '@/components/common/MiniCalendar';

interface DueDateIconButtonProps {
  /** 選択された期限日 */
  dueDate: Date | undefined;
  /** 期限日変更時のコールバック */
  onDueDateChange: (date: Date | undefined) => void;
  /** 無効化フラグ */
  disabled?: boolean;
}

/**
 * 期限日設定アイコンボタン
 *
 * Toggl風Row 3で使用するコンパクトな期限日設定ボタン
 */
export function DueDateIconButton({
  dueDate,
  onDueDateChange,
  disabled = false,
}: DueDateIconButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasDueDate = !!dueDate;

  // 日付フォーマット（短縮形）
  const dateDisplay = dueDate ? format(dueDate, 'M/d', { locale: ja }) : null;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDueDateChange(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverTooltip
        content={
          hasDueDate ? `期限: ${format(dueDate, 'yyyy/MM/dd', { locale: ja })}` : '期限を設定'
        }
        side="top"
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
              'hover:bg-state-hover focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              hasDueDate ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={hasDueDate ? `期限: ${dateDisplay}` : '期限を設定'}
          >
            <CalendarDays className="size-4" />
            {hasDueDate && (
              <>
                <span className="text-sm">{dateDisplay}</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="hover:bg-state-hover -mr-1 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
                  aria-label="期限をクリア"
                >
                  <X className="size-3" />
                </button>
              </>
            )}
          </button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        sideOffset={8}
        style={{ zIndex: zIndex.overlayDropdown }}
      >
        <MiniCalendar
          selectedDate={dueDate}
          onDateSelect={(date: Date | undefined) => {
            onDueDateChange(date);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
