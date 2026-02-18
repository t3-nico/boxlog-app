'use client';

import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CACHE_5_MINUTES } from '@/constants/time';
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { SettingsCard } from './SettingsCard';

import type { ValueKeyword } from '@/features/settings/types/personalization';
import { MAX_RANKED_VALUES, VALUE_KEYWORDS } from '@/features/settings/types/personalization';
import type { DragEndEvent, DropAnimation, Modifier } from '@dnd-kit/core';
import type { AnimateLayoutChanges } from '@dnd-kit/sortable';

/** ドラッグ中はレイアウトアニメーションを無効化（タグツリーと同じパターン） */
const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

const adjustTranslate: Modifier = ({ transform }) => ({
  ...transform,
  y: transform.y - 25,
});

interface RankingAutoSaveSettings {
  rankedValues: string[];
}

/**
 * 価値観キーワードランキング設定
 *
 * ACTベースの ~50個のキーワードから共感するものを選び、
 * トップ10をドラッグ&ドロップで並び替えるコンポーネント
 */
export function ValueRankingSettings() {
  const t = useTranslations();
  const utils = api.useUtils();

  const { data: dbSettings, isPending } = api.userSettings.get.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
  });

  const updateMutation = api.userSettings.update.useMutation({
    onSuccess: () => {
      utils.userSettings.get.invalidate();
    },
  });

  const initialValues = useMemo(
    () => ({
      rankedValues: (dbSettings?.personalization?.rankedValues ?? []) as string[],
    }),
    [dbSettings?.personalization?.rankedValues],
  );

  const autoSave = useAutoSaveSettings<RankingAutoSaveSettings>({
    initialValues,
    onSave: async (values) => {
      await updateMutation.mutateAsync({
        rankedValues: values.rankedValues,
      });
    },
    successMessage: t('settings.values.ranking.settingsSaved'),
    debounceMs: 800,
  });

  const selectedSet = useMemo(
    () => new Set(autoSave.values.rankedValues),
    [autoSave.values.rankedValues],
  );

  const handleKeywordToggle = useCallback(
    (keyword: ValueKeyword) => {
      const current = autoSave.values.rankedValues;
      if (selectedSet.has(keyword)) {
        autoSave.updateValue(
          'rankedValues',
          current.filter((k) => k !== keyword),
        );
      } else if (current.length < MAX_RANKED_VALUES) {
        autoSave.updateValue('rankedValues', [...current, keyword]);
      }
    },
    [autoSave, selectedSet],
  );

  const handleReorder = useCallback(
    (newOrder: string[]) => {
      autoSave.updateValue('rankedValues', newOrder);
    },
    [autoSave],
  );

  if (isPending) {
    return (
      <SettingsCard title={t('settings.values.ranking.title')}>
        <Skeleton className="mb-4 h-4 w-48" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-full" />
          ))}
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title={t('settings.values.ranking.title')} isSaving={autoSave.isSaving}>
      <p className="text-muted-foreground mb-4 text-sm">
        {t('settings.values.ranking.description')}
      </p>

      <KeywordGrid
        selected={selectedSet}
        onToggle={handleKeywordToggle}
        count={autoSave.values.rankedValues.length}
      />

      {autoSave.values.rankedValues.length > 0 && (
        <RankedList items={autoSave.values.rankedValues} onReorder={handleReorder} />
      )}
    </SettingsCard>
  );
}

interface KeywordGridProps {
  selected: Set<string>;
  onToggle: (keyword: ValueKeyword) => void;
  count: number;
}

function KeywordGrid({ selected, onToggle, count }: KeywordGridProps) {
  const t = useTranslations();
  const isAtLimit = count >= MAX_RANKED_VALUES;

  return (
    <div>
      <div className="text-muted-foreground mb-2 text-xs">
        {t('settings.values.ranking.selected', {
          count,
          max: MAX_RANKED_VALUES,
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {VALUE_KEYWORDS.map((keyword) => {
          const isSelected = selected.has(keyword);
          const isDisabled = !isSelected && isAtLimit;

          return (
            <button
              key={keyword}
              type="button"
              onClick={() => onToggle(keyword)}
              disabled={isDisabled}
              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Badge variant={isSelected ? 'primary' : 'outline'}>
                {t(`settings.values.keywords.${keyword}`)}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface RankedListProps {
  items: string[];
  onReorder: (items: string[]) => void;
}

function RankedList({ items, onReorder }: RankedListProps) {
  const t = useTranslations();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        onReorder(arrayMove(items, oldIndex, newIndex));
      }
    },
    [items, onReorder],
  );

  const activeItem = activeId ? activeId : null;

  return (
    <div className="mt-4">
      <div className="text-muted-foreground mb-2 text-xs">
        {t('settings.values.ranking.dragHint')}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={({ active }) => {
          setActiveId(active.id as string);
          document.body.style.setProperty('cursor', 'grabbing');
        }}
        onDragEnd={(event) => {
          document.body.style.setProperty('cursor', '');
          handleDragEnd(event);
        }}
        onDragCancel={() => {
          setActiveId(null);
          document.body.style.setProperty('cursor', '');
        }}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((keyword, index) => (
              <SortableRankItem
                key={keyword}
                id={keyword}
                rank={index + 1}
                label={t(`settings.values.keywords.${keyword}`)}
              />
            ))}
          </div>
        </SortableContext>
        {typeof document !== 'undefined' &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig} modifiers={[adjustTranslate]}>
              {activeItem ? (
                <RankItemOverlay label={t(`settings.values.keywords.${activeItem}`)} />
              ) : null}
            </DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
  );
}

interface SortableRankItemProps {
  id: string;
  rank: number;
  label: string;
}

function SortableRankItem({ id, rank, label }: SortableRankItemProps) {
  const t = useTranslations();
  const {
    attributes,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, animateLayoutChanges });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setDroppableNodeRef}
      style={style}
      className={cn(
        'border-border bg-background flex items-center gap-3 rounded-lg border px-3 py-2',
        isDragging && 'opacity-40',
      )}
    >
      <span className="text-muted-foreground w-5 text-right text-sm">{rank}</span>
      <span className="text-foreground flex-1 text-sm">{label}</span>
      <button
        ref={setDraggableNodeRef}
        type="button"
        className="text-muted-foreground hover:text-foreground cursor-grab touch-none"
        aria-label={t('settings.values.ranking.dragHint')}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  );
}

interface RankItemOverlayProps {
  label: string;
}

function RankItemOverlay({ label }: RankItemOverlayProps) {
  return (
    <div className="border-primary bg-background flex items-center gap-3 rounded-lg border-2 px-3 py-2 shadow-lg">
      <span className="text-foreground flex-1 text-sm">{label}</span>
      <GripVertical className="text-muted-foreground size-4" />
    </div>
  );
}
