'use client';

import { useCallback } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/theme-context';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings';
import { useLocale, useTranslations } from 'next-intl';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

interface PreferencesSettingsData {
  startupScreen: 'last' | 'plan' | 'calendar';
}

export function PreferencesSettings() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // 設定の自動保存
  const preferences = useAutoSaveSettings<PreferencesSettingsData>({
    initialValues: {
      startupScreen: 'last',
    },
    onSave: async (_values) => {
      // 環境設定API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 600));
    },
    successMessage: t('settings.preferences.settingsSaved'),
    debounceMs: 1000,
  });

  // Handler functions
  const handleLanguageChange = useCallback(
    (value: string) => {
      const newLocale = value as Locale;
      if (newLocale !== locale) {
        router.replace(pathname, { locale: newLocale });
        router.refresh();
      }
    },
    [locale, pathname, router],
  );

  const handleThemeChange = useCallback(
    (value: string) => {
      setTheme(value as 'system' | 'light' | 'dark');
    },
    [setTheme],
  );

  const handleStartupScreenChange = useCallback(
    (value: string) => {
      preferences.updateValue('startupScreen', value as 'last' | 'plan' | 'calendar');
    },
    [preferences],
  );

  return (
    <div className="space-y-8">
      {/* 言語とテーマ */}
      <SettingsCard
        title={t('settings.preferences.languageAndTheme')}
        isSaving={preferences.isSaving}
      >
        <div className="space-y-0">
          <SettingRow label={t('settings.preferences.language')}>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.preferences.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {routing.locales.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc === 'ja' ? '日本語' : 'English'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label={t('settings.preferences.themeLabel')}>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.preferences.selectTheme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('settings.preferences.themeSystem')}</SelectItem>
                <SelectItem value="light">{t('settings.preferences.themeLight')}</SelectItem>
                <SelectItem value="dark">{t('settings.preferences.themeDark')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* 起動設定 */}
      <SettingsCard title={t('settings.preferences.startup')} isSaving={preferences.isSaving}>
        <div className="space-y-0">
          <SettingRow label={t('settings.preferences.startupScreen')}>
            <Select
              value={preferences.values.startupScreen}
              onValueChange={handleStartupScreenChange}
            >
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.preferences.selectStartupScreen')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last">{t('settings.preferences.startupLast')}</SelectItem>
                <SelectItem value="plan">{t('settings.preferences.startupPlan')}</SelectItem>
                <SelectItem value="calendar">
                  {t('settings.preferences.startupCalendar')}
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </SettingsCard>
    </div>
  );
}
