'use client';

/**
 * アクティビティセクション
 * SidebarSection風のCollapsible + タイムラインUI
 */

import {
  Bell,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit,
  Plus,
  Repeat,
  Tag,
  Trash,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePlanActivities } from '../../../hooks/usePlanActivities';
import { formatActivity, formatRelativeTime } from '../../../utils/activityFormatter';

interface ActivitySectionProps {
  planId: string;
}

export function ActivitySection({ planId }: ActivitySectionProps) {
  const locale = useLocale();
  const t = useTranslations('settings');
  const { data: activities, isPending } = usePlanActivities(planId, { order: 'desc' });

  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger asChild>
        <div className="flex h-10 w-full cursor-pointer items-center gap-2 px-4 transition-colors">
          <div className="border-border/50 h-px flex-1 border-t" />
          <div className="hover:bg-state-hover flex items-center gap-1 rounded px-2 py-1 transition-colors">
            <span className="text-muted-foreground text-xs">アクティビティ</span>
            <ChevronDown className="text-muted-foreground size-3 transition-transform [[data-state=open]_&]:rotate-180" />
          </div>
          <div className="border-border/50 h-px flex-1 border-t" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {isPending ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="text-muted-foreground px-4 py-4 text-sm">{t('activity.noActivity')}</div>
        ) : (
          <div className="px-4 pb-4">
            {activities.map((activity, index) => {
              const formatted = formatActivity(activity);
              const IconComponent = getActivityIcon(formatted.icon);
              const isLast = index === activities.length - 1;

              return (
                <div key={activity.id} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="bg-surface-container relative z-10 flex size-8 flex-shrink-0 items-center justify-center rounded-full">
                      <IconComponent className="size-4" />
                    </div>
                    {!isLast && (
                      <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm leading-8 font-medium">{formatted.actionLabel}</span>
                      <span className="text-muted-foreground mt-2 flex-shrink-0 text-xs">
                        {formatRelativeTime(activity.created_at, locale)}
                      </span>
                    </div>
                    {formatted.detail && (
                      <p className="text-muted-foreground -mt-1 text-xs">{formatted.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
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
