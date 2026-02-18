'use client';

import { useCallback, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { CACHE_5_MINUTES } from '@/constants/time';
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';

import { SettingsCard } from './SettingsCard';

import type {
  PersonalizationCategory,
  PersonalizationValues,
} from '@/features/settings/types/personalization';
import { PERSONALIZATION_CATEGORIES } from '@/features/settings/types/personalization';

interface ValuesAutoSaveSettings {
  personalizationValues: PersonalizationValues;
}

/**
 * 価値評定スケール（ACT 12領域）
 *
 * 「最高の体調」（鈴木祐）のACT価値評定スケールに基づく12カテゴリ
 * カテゴリごとにフリーテキスト + 重要度(1-10)で記録
 * useAutoSaveSettingsで自動保存
 */
export function ValuesSettings() {
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
      personalizationValues: migrateValues(
        (dbSettings?.personalization?.values ?? {}) as Record<
          string,
          { text: string; importance?: number; priority?: number }
        >,
      ),
    }),
    [dbSettings?.personalization?.values],
  );

  const autoSave = useAutoSaveSettings<ValuesAutoSaveSettings>({
    initialValues,
    onSave: async (values) => {
      await updateMutation.mutateAsync({
        personalizationValues: values.personalizationValues,
      });
    },
    successMessage: t('settings.values.settingsSaved'),
    debounceMs: 800,
  });

  const handleTextChange = useCallback(
    (category: PersonalizationCategory, text: string) => {
      const current = autoSave.values.personalizationValues[category];
      autoSave.updateValue('personalizationValues', {
        ...autoSave.values.personalizationValues,
        [category]: {
          text,
          importance: current?.importance ?? 5,
        },
      });
    },
    [autoSave],
  );

  const handleImportanceChange = useCallback(
    (category: PersonalizationCategory, importance: number) => {
      const current = autoSave.values.personalizationValues[category];
      autoSave.updateValue('personalizationValues', {
        ...autoSave.values.personalizationValues,
        [category]: {
          text: current?.text ?? '',
          importance,
        },
      });
    },
    [autoSave],
  );

  if (isPending) {
    return (
      <SettingsCard title={t('settings.values.title')}>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title={t('settings.values.title')} isSaving={autoSave.isSaving}>
      <p className="text-muted-foreground mb-4 text-sm">{t('settings.values.description')}</p>

      <div className="space-y-4">
        {PERSONALIZATION_CATEGORIES.map((category) => {
          const value = autoSave.values.personalizationValues[category];
          return (
            <ValueCategoryCard
              key={category}
              category={category}
              text={value?.text ?? ''}
              importance={value?.importance ?? 5}
              onTextChange={handleTextChange}
              onImportanceChange={handleImportanceChange}
            />
          );
        })}
      </div>
    </SettingsCard>
  );
}

/**
 * 旧データ（priority: 1-5）から新データ（importance: 1-10）へのマイグレーション
 *
 * 旧priorityを2倍してimportanceに変換
 */
function migrateValues(
  raw: Record<string, { text: string; importance?: number; priority?: number }>,
): PersonalizationValues {
  const result: PersonalizationValues = {};
  for (const [key, value] of Object.entries(raw)) {
    result[key as PersonalizationCategory] = {
      text: value.text,
      importance: value.importance ?? (value.priority ? value.priority * 2 : 5),
    };
  }
  return result;
}

interface ValueCategoryCardProps {
  category: PersonalizationCategory;
  text: string;
  importance: number;
  onTextChange: (category: PersonalizationCategory, text: string) => void;
  onImportanceChange: (category: PersonalizationCategory, importance: number) => void;
}

function ValueCategoryCard({
  category,
  text,
  importance,
  onTextChange,
  onImportanceChange,
}: ValueCategoryCardProps) {
  const t = useTranslations();

  return (
    <div className="border-border rounded-2xl border p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-foreground text-sm font-normal">
            {t(`settings.values.categories.${category}`)}
          </h4>
          <p className="text-muted-foreground text-xs">
            {t(`settings.values.categories.${category}Desc`)}
          </p>
        </div>
        <ImportanceDots value={importance} onChange={(v) => onImportanceChange(category, v)} />
      </div>
      <Textarea
        value={text}
        onChange={(e) => onTextChange(category, e.target.value)}
        placeholder={t('settings.values.placeholder')}
        className="min-h-[60px] resize-none text-sm"
        rows={2}
      />
    </div>
  );
}

interface ImportanceDotsProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * 1-10の重要度ドットバー
 *
 * 10個の小さな丸ボタン。選択済みは bg-primary、未選択は bg-muted。
 */
function ImportanceDots({ value, onChange }: ImportanceDotsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Importance">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((dot) => (
        <button
          key={dot}
          type="button"
          className={cn(
            'size-3 rounded-full transition-colors',
            dot <= value ? 'bg-primary' : 'bg-muted',
          )}
          onClick={() => onChange(dot)}
          aria-label={`${dot}`}
        />
      ))}
    </div>
  );
}
