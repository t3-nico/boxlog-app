'use client';

import { useEffect, useRef, useState } from 'react';

import {
  Calendar,
  ClipboardCopy,
  Copy,
  Edit2,
  ExternalLink,
  Link,
  Tag,
  Trash2,
} from 'lucide-react';

import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface PlanContextMenuProps {
  plan: CalendarPlan;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit?: (plan: CalendarPlan) => void;
  onDelete?: (plan: CalendarPlan) => void;
  onDuplicate?: (plan: CalendarPlan) => void;
  onCopy?: (plan: CalendarPlan) => void;
  onOpen?: (plan: CalendarPlan) => void;
  onCopyLink?: (plan: CalendarPlan) => void;
  onAddTag?: (plan: CalendarPlan) => void;
  onMoveToDate?: (plan: CalendarPlan) => void;
}

export const EventContextMenu = ({
  plan,
  position,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onCopy,
  onOpen,
  onCopyLink,
  onAddTag,
  onMoveToDate,
}: PlanContextMenuProps) => {
  const t = useTranslations();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // 画面外に出ないよう位置調整
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x } = position;
      let { y } = position;

      // 右端を超える場合は左に表示
      if (x + rect.width > viewportWidth - 10) {
        x = Math.max(10, viewportWidth - rect.width - 10);
      }

      // 下端を超える場合は上に表示
      if (y + rect.height > viewportHeight - 10) {
        y = Math.max(10, viewportHeight - rect.height - 10);
      }

      setAdjustedPosition({ x, y });
    }
  }, [position]);

  // 外部クリック時にメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const menuItems = [
    {
      icon: ExternalLink,
      label: t('calendar.contextMenu.open'),
      action: () => onOpen?.(plan),
      available: !!onOpen,
    },
    {
      icon: Edit2,
      label: t('calendar.contextMenu.edit'),
      action: () => onEdit?.(plan),
      available: !!onEdit,
    },
    {
      icon: Copy,
      label: t('calendar.contextMenu.duplicate'),
      action: () => onDuplicate?.(plan),
      available: !!onDuplicate,
    },
    {
      icon: ClipboardCopy,
      label: t('calendar.contextMenu.copy'),
      action: () => onCopy?.(plan),
      available: !!onCopy,
    },
    {
      icon: Link,
      label: t('calendar.contextMenu.copyLink'),
      action: () => onCopyLink?.(plan),
      available: !!onCopyLink,
    },
    {
      icon: Tag,
      label: t('calendar.contextMenu.addTag'),
      action: () => onAddTag?.(plan),
      available: !!onAddTag,
    },
    {
      icon: Calendar,
      label: t('calendar.contextMenu.moveToDate'),
      action: () => onMoveToDate?.(plan),
      available: !!onMoveToDate,
    },
    {
      icon: Trash2,
      label: t('calendar.contextMenu.delete'),
      action: () => onDelete?.(plan),
      available: !!onDelete,
      dangerous: true,
    },
  ].filter((item) => item.available);

  return (
    <div
      ref={menuRef}
      className="border-border bg-popover text-popover-foreground fixed z-50 min-w-44 rounded-lg border p-2 text-sm shadow-md"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {/* メニューアイテム */}
      <div className="space-y-1">
        {menuItems.map((item, _index) => {
          const IconComponent = item.icon;

          return (
            <button
              type="button"
              key={item.label}
              onClick={() => handleAction(item.action)}
              className={cn(
                'flex w-full items-center gap-4 rounded px-4 py-2 text-left transition-colors',
                item.dangerous
                  ? 'text-destructive hover:bg-destructive-state-hover'
                  : 'text-foreground hover:bg-state-hover',
              )}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
