'use client';

import { useCallback, useMemo } from 'react';

import { ExternalLink, Star } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { useTranslations } from 'next-intl';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

import type { ChronotypeType, ProductivityZone } from '@/features/settings/types/chronotype';
import { CHRONOTYPE_PRESETS } from '@/features/settings/types/chronotype';

// クロノタイプごとの絵文字アイコン
const CHRONOTYPE_EMOJI: Record<Exclude<ChronotypeType, 'custom'>, string> = {
  lion: '🦁',
  bear: '🐻',
  wolf: '🐺',
  dolphin: '🐬',
};

// 生産性レベルの色（クロノタイプセマンティックトークン）
const LEVEL_COLORS: Record<ProductivityZone['level'], string> = {
  peak: 'bg-[var(--chronotype-peak)]',
  good: 'bg-[var(--chronotype-good)]',
  moderate: 'bg-[var(--chronotype-moderate)]',
  low: 'bg-[var(--chronotype-low)]',
  sleep: 'bg-[var(--chronotype-sleep)]',
};

// 生産性レベルの日本語ラベル
const LEVEL_LABELS: Record<ProductivityZone['level'], string> = {
  peak: 'ピーク',
  good: '集中',
  moderate: '通常',
  low: '低調',
  sleep: '睡眠',
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
        level: zone?.level || 'moderate',
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
      <div className="flex h-6 overflow-hidden rounded-md">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={cn(LEVEL_COLORS[segment.level], 'flex-1 transition-colors')}
            title={`${segment.hour}:00 - ${segment.label}`}
          />
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(['peak', 'good', 'moderate', 'low', 'sleep'] as const).map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div className={cn(LEVEL_COLORS[level], 'h-3 w-3 rounded')} />
            <span className="text-muted-foreground">{LEVEL_LABELS[level]}</span>
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
  const settings = useCalendarSettingsStore();
  const t = useTranslations();

  // 選択可能なタイプ（customは除外）
  const selectableTypes: Exclude<ChronotypeType, 'custom'>[] = ['bear', 'lion', 'wolf', 'dolphin'];

  // 自動保存システム
  const autoSave = useAutoSaveSettings<ChronotypeAutoSaveSettings>({
    initialValues: {
      chronotype: {
        enabled: settings.chronotype.enabled,
        type: settings.chronotype.type,
        displayMode: settings.chronotype.displayMode,
        opacity: settings.chronotype.opacity,
      },
    },
    onSave: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      settings.updateSettings({ chronotype: values.chronotype });
    },
    successMessage: t('settings.chronotype.settingsSaved'),
    debounceMs: 800,
  });

  // タイプ選択ハンドラー
  const handleTypeSelect = useCallback(
    (type: string) => {
      autoSave.updateValue('chronotype', {
        ...autoSave.values.chronotype,
        type: type as ChronotypeType,
      });
    },
    [autoSave],
  );

  // 現在選択中のタイプ
  const selectedType = autoSave.values.chronotype.type;
  const selectedProfile = selectedType !== 'custom' ? CHRONOTYPE_PRESETS[selectedType] : null;

  return (
    <div className="space-y-6">
      {/* タイプ選択セクション */}
      <SettingsCard title={t('settings.chronotype.title')} isSaving={autoSave.isSaving}>
        <div className="space-y-0">
          <SettingRow
            label={t('settings.chronotype.title')}
            value={
              <Select value={selectedType} onValueChange={handleTypeSelect}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectableTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CHRONOTYPE_EMOJI[type]} {CHRONOTYPE_PRESETS[type].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            isLast
          />
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
            <div className="flex items-start gap-3">
              <span className="text-3xl">
                {CHRONOTYPE_EMOJI[selectedType as Exclude<ChronotypeType, 'custom'>]}
              </span>
              <div>
                <h4 className="font-medium">{selectedProfile.name}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{selectedProfile.description}</p>
              </div>
            </div>

            {/* 24時間タイムライン */}
            <div className="pt-2">
              <h5 className="mb-3 text-sm font-medium">{t('settings.chronotype.timeline')}</h5>
              <TimelineBar zones={selectedProfile.productivityZones} />
            </div>

            {/* ピーク時間のハイライト */}
            <div className="bg-success/12 flex items-center gap-2 rounded-lg p-3">
              <Star className="text-success h-4 w-4" />
              <div>
                <span className="text-sm font-medium">{t('settings.chronotype.peakTime')}</span>
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
