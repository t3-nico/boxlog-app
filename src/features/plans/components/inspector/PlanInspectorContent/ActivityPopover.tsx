'use client';

import { CheckCircle, Clock, Plus, Tag, Trash } from 'lucide-react';
import { useMemo } from 'react';

import { usePlanActivities } from '../../../hooks/usePlanActivities';
import type { PlanActivityDisplay } from '../../../types/activity';
import { filterVisibleActivities, formatActivity } from '../../../utils/activityFormatter';
import { ActivityPopover } from '../shared';

import type { ActivityDisplayItem } from '../shared';

function getActivityIcon(icon: PlanActivityDisplay['icon']) {
  switch (icon) {
    case 'create':
      return Plus;
    case 'status':
      return CheckCircle;
    case 'tag':
      return Tag;
    case 'delete':
      return Trash;
    case 'time':
      return Clock;
    default:
      return Clock;
  }
}

interface PlanActivityPopoverProps {
  planId: string;
}

export function PlanActivityPopover({ planId }: PlanActivityPopoverProps) {
  const { data: activities, isPending } = usePlanActivities(planId, { order: 'desc' });

  const items: ActivityDisplayItem[] = useMemo(() => {
    const visible = filterVisibleActivities(activities ?? []);
    return visible.map((activity) => {
      const formatted = formatActivity(activity);
      return {
        id: activity.id,
        createdAt: activity.created_at,
        label: formatted.actionLabel,
        detail: formatted.detail,
        icon: getActivityIcon(formatted.icon),
        iconColor: formatted.iconColor,
      };
    });
  }, [activities]);

  return <ActivityPopover items={items} isPending={isPending} />;
}
