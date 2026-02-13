'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { CalendarPlus, Clock, FileText, History, Tag } from 'lucide-react';

import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { useTagModalNavigation } from '@/features/tags/hooks/useTagModalNavigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface EmptyAreaContextMenuProps {
  position: { x: number; y: number };
  clickedDateTime: {
    date: Date;
    hour: number;
    minute: number;
  };
  onClose: () => void;
}

export function EmptyAreaContextMenu({
  position,
  clickedDateTime,
  onClose,
}: EmptyAreaContextMenuProps) {
  const t = useTranslations();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const openInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);
  const { openTagCreateModal } = useTagModalNavigation();

  // クリック時刻から start_time / end_time（1時間枠）を生成
  const buildInitialData = useCallback(() => {
    const start = new Date(clickedDateTime.date);
    start.setHours(clickedDateTime.hour, clickedDateTime.minute, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    };
  }, [clickedDateTime]);

  // 画面外に出ないよう位置調整
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x } = position;
      let { y } = position;

      if (x + rect.width > viewportWidth - 10) {
        x = Math.max(10, viewportWidth - rect.width - 10);
      }

      if (y + rect.height > viewportHeight - 10) {
        y = Math.max(10, viewportHeight - rect.height - 10);
      }

      setAdjustedPosition({ x, y });
    }
  }, [position]);

  // 外部クリック・Escapeで閉じる
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
      icon: CalendarPlus,
      label: t('createSheet.plan'),
      action: () => openInspectorWithDraft(buildInitialData(), 'plan'),
      disabled: false,
      suffix: null,
    },
    {
      icon: Clock,
      label: t('createSheet.record'),
      action: () => openInspectorWithDraft(buildInitialData(), 'record'),
      disabled: false,
      suffix: null,
    },
    { separator: true as const },
    {
      icon: History,
      label: t('createSheet.history'),
      action: () => {},
      disabled: true,
      suffix: t('comingSoon'),
    },
    {
      icon: FileText,
      label: t('createSheet.template'),
      action: () => {},
      disabled: true,
      suffix: t('comingSoon'),
    },
    { separator: true as const },
    {
      icon: Tag,
      label: t('createNew.tag'),
      action: () => openTagCreateModal(),
      disabled: false,
      suffix: null,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="bg-card text-card-foreground border-border animate-in fade-in-0 zoom-in-95 fixed z-[350] min-w-[12rem] rounded-lg border p-1 shadow-lg motion-reduce:animate-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {menuItems.map((item, index) => {
        if ('separator' in item) {
          return <div key={`separator-${index}`} className="bg-border my-1 h-px" />;
        }

        const IconComponent = item.icon;

        return (
          <button
            type="button"
            key={item.label}
            onClick={() => !item.disabled && handleAction(item.action)}
            disabled={item.disabled}
            className={cn(
              'flex w-full cursor-default items-center gap-2 rounded px-2 py-2 text-left text-sm outline-hidden transition-colors select-none',
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              item.disabled
                ? 'text-muted-foreground cursor-not-allowed opacity-50'
                : "text-foreground hover:bg-state-hover focus:bg-state-focus [&_svg:not([class*='text-'])]:text-muted-foreground",
            )}
          >
            <IconComponent />
            <span>{item.label}</span>
            {item.suffix ? (
              <span className="text-muted-foreground ml-auto text-xs">{item.suffix}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
