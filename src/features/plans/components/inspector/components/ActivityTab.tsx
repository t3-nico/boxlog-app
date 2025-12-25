'use client';

import { CheckCircle, Edit, Plus, Tag, Trash } from 'lucide-react';

import { usePlanActivities } from '../../../hooks/usePlanActivities';
import { formatActivity, formatRelativeTime } from '../../../utils/activityFormatter';

interface ActivityTabProps {
  planId: string;
  order: 'asc' | 'desc';
}

export function ActivityTab({ planId, order }: ActivityTabProps) {
  const { data: activities, isPending } = usePlanActivities(planId, { order });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        まだアクティビティがありません
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
            <div key={activity.id} className="flex gap-3">
              <div className="relative flex flex-col items-center">
                <div className="bg-surface-container relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <IconComponent className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div className="bg-border absolute top-8 left-1/2 h-full w-px -translate-x-1/2" />
                )}
              </div>

              <div className="flex-1 space-y-1 pb-6">
                <p className="text-sm">{formatted.message}</p>
                <p className="text-muted-foreground text-xs">
                  {formatRelativeTime(activity.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getActivityIcon(icon: 'create' | 'update' | 'status' | 'tag' | 'delete') {
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
    default:
      return Edit;
  }
}
