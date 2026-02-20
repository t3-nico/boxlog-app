'use client';

import { Clock, Plus, Star, Tag, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { ActivityPopover } from '@/features/plans/components/inspector/shared';

import { useRecordActivities } from '../hooks/useRecordActivities';
import type { RecordActivity, RecordActivityDisplay } from '../types/activity';
import { filterVisibleActivities, formatActivity } from '../utils/activityFormatter';

import type { ActivityDisplayItem } from '@/features/plans/components/inspector/shared';

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

interface RecordActivityPopoverProps {
  recordId: string;
}

export function RecordActivityPopover({ recordId }: RecordActivityPopoverProps) {
  const t = useTranslations();
  const { data: activities, isPending } = useRecordActivities(recordId, { order: 'desc' });

  const items: ActivityDisplayItem[] = useMemo(() => {
    const visible = filterVisibleActivities((activities ?? []) as RecordActivity[]);
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
