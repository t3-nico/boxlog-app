'use client';

import { useCallback, useMemo } from 'react';

import { ExternalLink, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { CACHE_5_MINUTES } from '@/lib/date';
import { cn } from '@/lib/utils';
import { api } from '@/platform/trpc';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';

import {
  CHRONOTYPE_EMOJI,
  CHRONOTYPE_LEVEL_CLASSES,
  CHRONOTYPE_LEVEL_ORDER,
  CHRONOTYPE_PRESETS,
  CHRONOTYPE_SELECTABLE_TYPES,
  DEFAULT_CHRONOTYPE_SETTINGS,
} from '../lib/constants';
import { getPeakHours, getPresetChronotypeProfile } from '../lib/utils';

import { SettingRow } from '@/components/common/SettingRow';
import { SettingsCard } from '@/components/common/SettingsCard';
import { useAutoSaveSettings } from '@/hooks/useAutoSaveSettings';

import type {
  ChronotypeDisplayMode,
  ChronotypeSettings as ChronotypeSettingsState,
  ChronotypeType,
  PresetChronotypeType,
  ProductivityZone,
} from '../types';

interface ChronotypeAutoSaveSettings {
  chronotype: ChronotypeSettingsState;
}

function TimelineBar({ zones }: { zones: ProductivityZone[] }) {
  const t = useTranslations();

  const segments = useMemo(() => {
    const result: Array<{ hour: number; level: ProductivityZone['level']; label: string }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const zone = zones.find((item) => {
        if (item.startHour <= item.endHour) {
          return hour >= item.startHour && hour < item.endHour;
        }

        return hour >= item.startHour || hour < item.endHour;
      });

      result.push({
        hour,
        level: zone?.level ?? 'warmup',
        label: zone?.label ?? '',
      });
    }

    return result;
  }, [zones]);

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>0時</span>
        <span>6時</span>
        <span>12時</span>
        <span>18時</span>
        <span>24時</span>
      </div>

      <div className="flex h-6 overflow-hidden rounded-lg">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={cn(CHRONOTYPE_LEVEL_CLASSES[segment.level], 'flex-1 transition-colors')}
            title={`${segment.hour}:00 - ${segment.label}`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        {CHRONOTYPE_LEVEL_ORDER.map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div className={cn(CHRONOTYPE_LEVEL_CLASSES[level], 'h-3 w-3 rounded')} />
            <span className="text-muted-foreground">
              {t(`settings.chronotype.levels.${level}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChronotypeSettings() {
  const t = useTranslations();
  const utils = api.useUtils();
  const updateStoreSettings = useCalendarSettingsStore((state) => state.updateSettings);

  const { data: dbSettings, isPending } = api.userSettings.get.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
  });

  const updateMutation = api.userSettings.update.useMutation({
    onSuccess: () => {
      utils.userSettings.get.invalidate();
    },
  });

  const NONE_VALUE = 'none';

  const dbChronotype = dbSettings?.chronotype;
  const initialValues = useMemo(
    () => ({
      chronotype: {
        ...DEFAULT_CHRONOTYPE_SETTINGS,
        enabled: dbChronotype?.enabled ?? DEFAULT_CHRONOTYPE_SETTINGS.enabled,
        type: (dbChronotype?.type as ChronotypeType) ?? DEFAULT_CHRONOTYPE_SETTINGS.type,
        displayMode:
          (dbChronotype?.displayMode as ChronotypeDisplayMode) ??
          DEFAULT_CHRONOTYPE_SETTINGS.displayMode,
        opacity: dbChronotype?.opacity ?? DEFAULT_CHRONOTYPE_SETTINGS.opacity,
      },
    }),
    [dbChronotype?.displayMode, dbChronotype?.enabled, dbChronotype?.opacity, dbChronotype?.type],
  );

  const autoSave = useAutoSaveSettings<ChronotypeAutoSaveSettings>({
    initialValues,
    onSave: async (values) => {
      await updateMutation.mutateAsync({
        chronotypeEnabled: values.chronotype.enabled,
        chronotypeType: values.chronotype.type,
        chronotypeDisplayMode: values.chronotype.displayMode,
        chronotypeOpacity: values.chronotype.opacity,
      });
    },
    successMessage: t('settings.chronotype.settingsSaved'),
    debounceMs: 800,
  });

  const handleTypeSelect = useCallback(
    (value: string) => {
      const nextChronotype =
        value === NONE_VALUE
          ? { ...autoSave.values.chronotype, enabled: false }
          : { ...autoSave.values.chronotype, enabled: true, type: value as ChronotypeType };

      updateStoreSettings({ chronotype: nextChronotype });
      autoSave.updateValue('chronotype', nextChronotype);
    },
    [autoSave, updateStoreSettings],
  );

  const handleTimelineToggle = useCallback(
    (checked: boolean) => {
      const nextChronotype: ChronotypeSettingsState = {
        ...autoSave.values.chronotype,
        displayMode: checked ? 'background' : 'border',
      };

      updateStoreSettings({ chronotype: nextChronotype });
      autoSave.updateValue('chronotype', nextChronotype);
    },
    [autoSave, updateStoreSettings],
  );

  const isEnabled = autoSave.values.chronotype.enabled;
  const selectedType = autoSave.values.chronotype.type;
  const selectValue = isEnabled ? selectedType : NONE_VALUE;
  const showOnTimeline =
    autoSave.values.chronotype.displayMode === 'background' ||
    autoSave.values.chronotype.displayMode === 'both';
  const selectedProfile = isEnabled ? getPresetChronotypeProfile(selectedType) : null;

  if (isPending) {
    return (
      <SettingsCard title={t('settings.chronotype.title')}>
        <Skeleton className="h-12 w-full rounded-lg" />
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-8">
      <SettingsCard title={t('settings.chronotype.title')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.chronotype.title')}>
            <Select value={selectValue} onValueChange={handleTypeSelect}>
              <SelectTrigger variant="ghost">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>{t('settings.chronotype.notSelected')}</SelectItem>
                {CHRONOTYPE_SELECTABLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CHRONOTYPE_EMOJI[type]} {CHRONOTYPE_PRESETS[type].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          {isEnabled ? (
            <SettingRow
              label={t('settings.chronotype.showOnTimeline')}
              description={t('settings.chronotype.showOnTimelineDesc')}
            >
              <Switch checked={showOnTimeline} onCheckedChange={handleTimelineToggle} />
            </SettingRow>
          ) : null}
        </div>

        <div className="mt-4">
          <a
            href="https://sleepdoctor.com/pages/chronotypes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline transition-colors"
          >
            <span>{t('settings.chronotype.learnMore')}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </SettingsCard>

      {selectedProfile ? (
        <SettingsCard title={t('settings.chronotype.details')}>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl">
                {CHRONOTYPE_EMOJI[selectedType as PresetChronotypeType]}
              </span>
              <div>
                <h4 className="font-normal">{selectedProfile.name}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{selectedProfile.description}</p>
              </div>
            </div>

            <div className="pt-2">
              <h5 className="mb-4 text-sm font-normal">{t('settings.chronotype.timeline')}</h5>
              <TimelineBar zones={selectedProfile.productivityZones} />
            </div>

            <div className="bg-success/10 flex items-center gap-2 rounded-2xl p-4">
              <Star className="text-success h-4 w-4" />
              <div>
                <span className="text-sm font-normal">{t('settings.chronotype.peakTime')}</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  {getPeakHours(selectedProfile.productivityZones)}
                </span>
              </div>
            </div>
          </div>
        </SettingsCard>
      ) : null}
    </div>
  );
}
