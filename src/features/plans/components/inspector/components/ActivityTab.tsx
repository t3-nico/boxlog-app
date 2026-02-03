'use client';

import {
  Bell,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Repeat,
  Tag,
  Trash,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';
import { usePlanActivities } from '../../../hooks/usePlanActivities';
import { formatActivity, formatRelativeTime } from '../../../utils/activityFormatter';

interface ActivityTabProps {
  planId: string;
  order: 'asc' | 'desc';
}

export function ActivityTab({ planId, order }: ActivityTabProps) {
  const locale = useLocale();
  const t = useTranslations('settings');
  const { data: activities, isPending } = usePlanActivities(planId, { order });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        {t('activity.noActivity')}
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4">
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
                  <span className="text-sm leading-8 font-bold">{formatted.actionLabel}</span>
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
    </div>
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
