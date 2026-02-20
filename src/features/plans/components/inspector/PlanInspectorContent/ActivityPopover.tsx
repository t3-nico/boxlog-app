'use client';

import { CheckCircle, Clock, Plus, Tag, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { usePlanActivities } from '../../../hooks/usePlanActivities';
import type { PlanActivity, PlanActivityDisplay } from '../../../types/activity';
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
  const t = useTranslations();
  const { data: activities, isPending } = usePlanActivities(planId, { order: 'desc' });

  const items: ActivityDisplayItem[] = useMemo(() => {
    const visible = filterVisibleActivities((activities ?? []) as PlanActivity[]);
    return visible.map((activity) => {
      const formatted = formatActivity(activity);
      return {
        id: activity.id,
        createdAt: activity.created_at,
        label: t(formatted.actionLabelKey),
        detail: formatted.detail,
        icon: getActivityIcon(formatted.icon),
        iconColor: formatted.iconColor,
      };
    });
  }, [activities, t]);

  return <ActivityPopover items={items} isPending={isPending} />;
}
