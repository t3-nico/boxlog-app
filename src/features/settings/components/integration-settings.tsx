'use client';

import { memo, useCallback, useEffect, useState } from 'react';

import {
  Bot,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ApiKeyStorage } from '@/lib/security/encryption';
import { useAuthStore } from '@/stores/useAuthStore';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

interface Integration {
  id: string;
  name: string;
  descriptionKey: 'googleCalendarDesc' | 'slackDesc';
  icon: React.ReactNode;
}

interface AIProvider {
  id: string;
  name: string;
  descriptionKey: 'anthropicDesc' | 'openaiDesc';
  keyPrefix: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    descriptionKey: 'anthropicDesc',
    keyPrefix: 'sk-ant-',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    descriptionKey: 'openaiDesc',
    keyPrefix: 'sk-',
  },
];

const INTEGRATIONS: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    descriptionKey: 'googleCalendarDesc',
    icon: <Calendar className="text-primary h-5 w-5" />,
  },
  {
    id: 'slack',
    name: 'Slack',
    descriptionKey: 'slackDesc',
    icon: <MessageSquare className="text-primary h-5 w-5" />,
  },
];

export const IntegrationSettings = memo(function IntegrationSettings() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user);

  // AI API Keys state
  const [aiKeys, setAiKeys] = useState<Record<string, string>>({
    anthropic: '',
    openai: '',
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    anthropic: false,
    openai: false,
  });
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({
    anthropic: false,
    openai: false,
  });
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({
    anthropic: false,
    openai: false,
  });

  // 保存済みのAPIキーを読み込み
  useEffect(() => {
    const loadSavedKeys = async () => {
      if (!user?.id) return;

      for (const provider of AI_PROVIDERS) {
        const exists = ApiKeyStorage.exists(provider.id);
        if (exists) {
          const key = await ApiKeyStorage.load(provider.id, user.id);
          if (key) {
            setAiKeys((prev) => ({ ...prev, [provider.id]: key }));
            setSavedKeys((prev) => ({ ...prev, [provider.id]: true }));
          }
        }
      }
    };

    loadSavedKeys();
  }, [user?.id]);

  const handleAiKeyChange = useCallback((providerId: string, value: string) => {
    setAiKeys((prev) => ({ ...prev, [providerId]: value }));
    setSavedKeys((prev) => ({ ...prev, [providerId]: false }));
  }, []);

  const toggleKeyVisibility = useCallback((providerId: string) => {
    setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  }, []);

  const handleSaveApiKey = useCallback(
    async (providerId: string) => {
      if (!user?.id || !aiKeys[providerId]) return;

      setSavingKeys((prev) => ({ ...prev, [providerId]: true }));

      try {
        const success = await ApiKeyStorage.save(providerId, aiKeys[providerId], user.id);
        if (success) {
          setSavedKeys((prev) => ({ ...prev, [providerId]: true }));
        }
      } finally {
        setSavingKeys((prev) => ({ ...prev, [providerId]: false }));
      }
    },
    [user?.id, aiKeys],
  );

  const handleDeleteApiKey = useCallback((providerId: string) => {
    ApiKeyStorage.delete(providerId);
    setAiKeys((prev) => ({ ...prev, [providerId]: '' }));
    setSavedKeys((prev) => ({ ...prev, [providerId]: false }));
  }, []);

  const [syncEnabled, setSyncEnabled] = useState(true);

  const handleSyncChange = useCallback((checked: boolean) => {
    setSyncEnabled(checked);
  }, []);

  return (
    <div className="space-y-8">
      {/* AI設定 */}
      <SettingsCard title={t('settings.integrations.ai.title')}>
        <div className="space-y-4">
          <div className="bg-card border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              {t('settings.integrations.ai.description')}
            </p>
          </div>

          {AI_PROVIDERS.map((provider) => (
            <div key={provider.id} className="border-border rounded-2xl border p-4">
              <div className="flex items-start gap-4">
                <div className="bg-container flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                  <Bot className="text-primary h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-normal">{provider.name}</h4>
                    {savedKeys[provider.id] && (
                      <Badge variant="outline" className="text-success gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('settings.integrations.ai.saved')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t(`settings.integrations.ai.${provider.descriptionKey}`)}
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        placeholder={`${provider.keyPrefix}...`}
                        value={aiKeys[provider.id]}
                        onChange={(e) => handleAiKeyChange(provider.id, e.target.value)}
                        className="pr-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon
                        className="absolute top-1/2 right-1 -translate-y-1/2"
                        onClick={() => toggleKeyVisibility(provider.id)}
                        aria-label={
                          showKeys[provider.id]
                            ? t('settings.integrations.ai.hideKey')
                            : t('settings.integrations.ai.showKey')
                        }
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleSaveApiKey(provider.id)}
                      disabled={!aiKeys[provider.id] || savingKeys[provider.id]}
                    >
                      {savingKeys[provider.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('settings.integrations.ai.save')
                      )}
                    </Button>
                    {savedKeys[provider.id] && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteApiKey(provider.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label={t('settings.integrations.ai.deleteKey')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* 連携サービス一覧 */}
      <SettingsCard title={t('settings.integrations.services.title')}>
        <div className="space-y-4">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.id}
              className="border-border flex items-center justify-between rounded-2xl border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-container flex h-10 w-10 items-center justify-center rounded-2xl">
                  {integration.icon}
                </div>
                <div>
                  <h4 className="text-sm font-normal">{integration.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t(`settings.integrations.services.${integration.descriptionKey}`)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('common.comingSoon')}
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* 同期設定 */}
      <SettingsCard title={t('settings.integrations.sync.title')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.integrations.sync.enableLabel')}>
            <Switch checked={syncEnabled} onCheckedChange={handleSyncChange} />
          </SettingRow>
        </div>
        {syncEnabled && (
          <div className="bg-card border-border mt-4 rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              {t('settings.integrations.sync.description')}
            </p>
          </div>
        )}
      </SettingsCard>

      {/* API連携 */}
      <SettingsCard title={t('settings.integrations.api.title')}>
        <div className="space-y-4">
          <div className="bg-card border-border rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              {t('settings.integrations.api.description')}
            </p>
          </div>
          <Button variant="ghost" disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('settings.integrations.api.openPortal')}
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
});
