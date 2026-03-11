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
import { CACHE_5_MINUTES } from '@/constants/time';
import { api } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore';
import { useAutoSaveSettings } from '../hooks/useAutoSaveSettings';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

import type { ChronotypeType, ProductivityZone } from '@/core/types/chronotype';
import { CHRONOTYPE_PRESETS, LEVEL_COLORS } from '@/core/types/chronotype';

// クロノタイプごとの絵文字アイコン
const CHRONOTYPE_EMOJI: Record<Exclude<ChronotypeType, 'custom'>, string> = {
  lion: '🦁',
  bear: '🐻',
  wolf: '🐺',
  dolphin: '🐬',
};

interface ChronotypeAutoSaveSettings {
  chronotype: {
    enabled: boolean;
    type: ChronotypeType;
    displayMode: 'border' | 'background' | 'both';
    opacity: number;
  };
}

/**
 * 24時間タイムラインバーコンポーネント
 */
function TimelineBar({ zones }: { zones: ProductivityZone[] }) {
  const t = useTranslations();
  // 0-24時間を表すバーを生成
  const segments = useMemo(() => {
    const result: Array<{ hour: number; level: ProductivityZone['level']; label: string }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const zone = zones.find((z) => {
        if (z.startHour <= z.endHour) {
          return hour >= z.startHour && hour < z.endHour;
        } else {
          // 日跨ぎの時間帯
          return hour >= z.startHour || hour < z.endHour;
        }
      });

      result.push({
        hour,
        level: zone?.level || 'warmup',
        label: zone?.label || '',
      });
    }

    return result;
  }, [zones]);

  return (
    <div className="space-y-2">
      {/* 時間ラベル */}
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>0時</span>
        <span>6時</span>
        <span>12時</span>
        <span>18時</span>
        <span>24時</span>
      </div>

      {/* タイムラインバー */}
      <div className="flex h-6 overflow-hidden rounded-lg">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={cn(LEVEL_COLORS[segment.level], 'flex-1 transition-colors')}
            title={`${segment.hour}:00 - ${segment.label}`}
          />
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-4 text-xs">
        {(['warmup', 'peak', 'dip', 'recovery', 'winddown'] as const).map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div className={cn(LEVEL_COLORS[level], 'h-3 w-3 rounded')} />
            <span className="text-muted-foreground">
              {t(`settings.chronotype.levels.${level}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ピーク時間の取得
 */
function getPeakHours(zones: ProductivityZone[]): string {
  const peakZone = zones.find((z) => z.level === 'peak');
  if (!peakZone) return '-';

  const formatHour = (hour: number) => `${hour}:00`;
  return `${formatHour(peakZone.startHour)} - ${formatHour(peakZone.endHour)}`;
}

/**
 * クロノタイプ設定コンポーネント
 */
export function ChronotypeSettings() {
  const t = useTranslations();
  const utils = api.useUtils();
  const updateStoreSettings = useCalendarSettingsStore((s) => s.updateSettings);

  // DBから直接クロノタイプ設定を取得（Zustandストアに依存しない）
  const { data: dbSettings, isPending } = api.userSettings.get.useQuery(undefined, {
    staleTime: CACHE_5_MINUTES,
  });

  // tRPC mutation（DB保存 → キャッシュ無効化でステータスバーも自動更新）
  const updateMutation = api.userSettings.update.useMutation({
    onSuccess: () => {
      utils.userSettings.get.invalidate();
    },
  });

  // 選択可能なタイプ（customは除外）
  const selectableTypes: Exclude<ChronotypeType, 'custom'>[] = ['bear', 'lion', 'wolf', 'dolphin'];

  // 未選択を表す特別な値
  const NONE_VALUE = 'none';

  // DB値から初期値を構築（DBにデータがない場合はデフォルト）
  const dbChronotype = dbSettings?.chronotype;
  const initialValues = useMemo(
    () => ({
      chronotype: {
        enabled: dbChronotype?.enabled ?? false,
        type: (dbChronotype?.type as ChronotypeType) ?? 'bear',
        displayMode: (dbChronotype?.displayMode as 'border' | 'background' | 'both') ?? 'border',
        opacity: dbChronotype?.opacity ?? 90,
      },
    }),
    [dbChronotype?.enabled, dbChronotype?.type, dbChronotype?.displayMode, dbChronotype?.opacity],
  );

  // 自動保存システム（DB保存 + Zustand store 同期）
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

  // タイプ選択ハンドラー
  const handleTypeSelect = useCallback(
    (value: string) => {
      const newChronotype =
        value === NONE_VALUE
          ? { ...autoSave.values.chronotype, enabled: false }
          : { ...autoSave.values.chronotype, enabled: true, type: value as ChronotypeType };
      // Zustand store を即座に更新（カレンダーに即反映）
      updateStoreSettings({ chronotype: newChronotype });
      autoSave.updateValue('chronotype', newChronotype);
    },
    [autoSave, updateStoreSettings],
  );

  // タイムライン背景表示トグルハンドラー
  const handleTimelineToggle = useCallback(
    (checked: boolean) => {
      const newChronotype = {
        ...autoSave.values.chronotype,
        displayMode: (checked ? 'background' : 'border') as 'border' | 'background' | 'both',
      };
      // Zustand store を即座に更新（カレンダーに即反映）
      updateStoreSettings({ chronotype: newChronotype });
      autoSave.updateValue('chronotype', newChronotype);
    },
    [autoSave, updateStoreSettings],
  );

  // 現在選択中のタイプ（未選択の場合は NONE_VALUE）
  const isEnabled = autoSave.values.chronotype.enabled;
  const selectedType = autoSave.values.chronotype.type;
  const selectValue = isEnabled ? selectedType : NONE_VALUE;
  const showOnTimeline =
    autoSave.values.chronotype.displayMode === 'background' ||
    autoSave.values.chronotype.displayMode === 'both';
  const selectedProfile =
    isEnabled && selectedType !== 'custom' ? CHRONOTYPE_PRESETS[selectedType] : null;

  if (isPending) {
    return (
      <SettingsCard title={t('settings.chronotype.title')}>
        <Skeleton className="h-12 w-full rounded-lg" />
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* タイプ選択セクション */}
      <SettingsCard title={t('settings.chronotype.title')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.chronotype.title')}>
            <Select value={selectValue} onValueChange={handleTypeSelect}>
              <SelectTrigger variant="ghost">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>{t('settings.chronotype.notSelected')}</SelectItem>
                {selectableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CHRONOTYPE_EMOJI[type]} {CHRONOTYPE_PRESETS[type].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          {isEnabled && (
            <SettingRow
              label={t('settings.chronotype.showOnTimeline')}
              description={t('settings.chronotype.showOnTimelineDesc')}
            >
              <Switch checked={showOnTimeline} onCheckedChange={handleTimelineToggle} />
            </SettingRow>
          )}
        </div>

        {/* 参考リンク */}
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

      {/* 選択中のタイプの詳細 */}
      {selectedProfile && (
        <SettingsCard title={t('settings.chronotype.details')}>
          <div className="space-y-4">
            {/* タイプ名と説明 */}
            <div className="flex items-start gap-4">
              <span className="text-3xl">
                {CHRONOTYPE_EMOJI[selectedType as Exclude<ChronotypeType, 'custom'>]}
              </span>
              <div>
                <h4 className="font-normal">{selectedProfile.name}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{selectedProfile.description}</p>
              </div>
            </div>

            {/* 24時間タイムライン */}
            <div className="pt-2">
              <h5 className="mb-4 text-sm font-normal">{t('settings.chronotype.timeline')}</h5>
              <TimelineBar zones={selectedProfile.productivityZones} />
            </div>

            {/* ピーク時間のハイライト */}
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
      )}
    </div>
  );
}
