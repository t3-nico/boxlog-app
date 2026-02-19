'use client';

import { Clock, History, Plus, Star, Tag, Trash } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { HoverTooltip } from '@/components/ui/tooltip';
import { zIndex } from '@/config/ui/z-index';

import { useRecordActivities } from '../hooks/useRecordActivities';
import type { ActivityIconColor, RecordActivityDisplay } from '../types/activity';
import {
  filterVisibleActivities,
  formatActivity,
  formatRelativeTime,
} from '../utils/activityFormatter';

interface RecordActivityPopoverProps {
  recordId: string;
}

export function RecordActivityPopover({ recordId }: RecordActivityPopoverProps) {
  const locale = useLocale();
  const tSettings = useTranslations('settings');
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const { data: activities, isPending } = useRecordActivities(recordId, { order: 'desc' });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <HoverTooltip content={tSettings('tabs.activity')} side="top">
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" icon aria-label={tSettings('tabs.activity')}>
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
        <div className="px-4 py-4">
          <h3 className="text-sm font-bold">{tSettings('tabs.activity')}</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : (
            (() => {
              const visibleActivities = filterVisibleActivities(activities ?? []);
              if (visibleActivities.length === 0) {
                return (
                  <div className="text-muted-foreground px-4 py-8 text-center text-sm">
                    {tSettings('activity.noActivity')}
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
                          <div className="bg-container relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
                            <IconComponent
                              className={`size-4 ${getIconColor(formatted.iconColor)}`}
                            />
                          </div>
                          {!isLast && (
                            <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                          )}
                        </div>

                        {/* コンテンツ */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm leading-8 font-bold">
                              {t(formatted.actionLabelKey)}
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

function getActivityIcon(icon: RecordActivityDisplay['icon']) {
  switch (icon) {
    case 'create':
      return Plus;
    case 'tag':
      return Tag;
    case 'delete':
      return Trash;
    case 'time':
      return Clock;
    case 'fulfillment':
      return Star;
    default:
      return Clock;
  }
}

function getIconColor(color: ActivityIconColor): string {
  switch (color) {
    case 'success':
      return 'text-success';
    case 'destructive':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}
