'use client';

import {
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  History,
  Plus,
  Repeat,
  Tag,
  Trash,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';
import { cn } from '@/lib/utils';

import { usePlanActivities } from '../../../hooks/usePlanActivities';
import type { ActivityIconColor } from '../../../types/activity';
import {
  filterVisibleActivities,
  formatActivity,
  formatRelativeTime,
} from '../../../utils/activityFormatter';

interface ActivityPopoverProps {
  planId: string;
}

export function ActivityPopover({ planId }: ActivityPopoverProps) {
  const locale = useLocale();
  const t = useTranslations('settings');
  const tCommon = useTranslations();
  const [open, setOpen] = useState(false);
  const { data: activities, isPending } = usePlanActivities(planId, { order: 'desc' });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <HoverTooltip content={t('tabs.activity')} side="top">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={t('tabs.activity')}>
            <History className="size-5" />
          </Button>
        </PopoverTrigger>
      </HoverTooltip>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0"
        style={{ zIndex: zIndex.overlayDropdown }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <h3 className="text-sm font-medium">{t('tabs.activity')}</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:bg-state-hover hover:text-foreground rounded-lg p-1 transition-colors"
            aria-label={tCommon('actions.close')}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            (() => {
              const visibleActivities = filterVisibleActivities(activities ?? []);
              if (visibleActivities.length === 0) {
                return (
                  <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                    {t('activity.noActivity')}
                  </div>
                );
              }
              return (
                <div className="px-4 py-4">
                  {visibleActivities.map((activity, index) => {
                    const formatted = formatActivity(activity);
                    const IconComponent = getActivityIcon(formatted.icon);
                    const isLast = index === visibleActivities.length - 1;

                    return (
                      <div key={activity.id} className="flex gap-4">
                        {/* アイコン（色付き） */}
                        <div className="relative flex flex-col items-center">
                          <div
                            className={cn(
                              'relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full',
                              getIconBgColor(formatted.iconColor),
                            )}
                          >
                            <IconComponent
                              className={cn('size-4', getIconColor(formatted.iconColor))}
                            />
                          </div>
                          {!isLast && (
                            <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                          )}
                        </div>

                        {/* コンテンツ */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm leading-8 font-medium">
                              {formatted.actionLabel}
                            </span>
                            <span className="text-muted-foreground mt-2 flex-shrink-0 text-xs">
                              {formatRelativeTime(activity.created_at, locale)}
                            </span>
                          </div>
                          {formatted.detail && (
                            <p className="text-muted-foreground -mt-1 text-xs">
                              {formatted.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getActivityIcon(
  icon:
    | 'create'
    | 'update'
    | 'status'
    | 'tag'
    | 'delete'
    | 'time'
    | 'due_date'
    | 'recurrence'
    | 'reminder',
) {
  switch (icon) {
    case 'create':
      return Plus;
    case 'update':
      return Edit;
    case 'status':
      return CheckCircle;
    case 'tag':
      return Tag;
    case 'delete':
      return Trash;
    case 'time':
      return Clock;
    case 'due_date':
      return CalendarDays;
    case 'recurrence':
      return Repeat;
    case 'reminder':
      return Bell;
    default:
      return Edit;
  }
}

function getIconColor(color: ActivityIconColor): string {
  switch (color) {
    case 'success':
      return 'text-success';
    case 'info':
      return 'text-info';
    case 'warning':
      return 'text-warning';
    case 'primary':
      return 'text-primary';
    case 'destructive':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function getIconBgColor(color: ActivityIconColor): string {
  switch (color) {
    case 'success':
      return 'bg-success/10';
    case 'info':
      return 'bg-info/10';
    case 'warning':
      return 'bg-warning/10';
    case 'primary':
      return 'bg-primary/10';
    case 'destructive':
      return 'bg-destructive/10';
    default:
      return 'bg-surface-container';
  }
}
