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
  Unplug,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { ApiKeyStorage } from '@/lib/security/encryption';

import { SettingField } from './fields/SettingField';
import { SettingsCard } from './SettingsCard';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  status?: 'active' | 'inactive' | 'error';
}

interface AIProvider {
  id: string;
  name: string;
  description: string;
  keyPrefix: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    description: 'Anthropic社のClaudeを使用します',
    keyPrefix: 'sk-ant-',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI社のGPTモデルを使用します',
    keyPrefix: 'sk-',
  },
];

export const IntegrationSettings = memo(function IntegrationSettings() {
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
    // キーが変更されたら保存済みフラグをリセット
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

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Googleカレンダーと予定を同期します',
      icon: <Calendar className="text-primary h-5 w-5" />,
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Slackにリマインダーや通知を送信します',
      icon: <MessageSquare className="text-primary h-5 w-5" />,
      connected: false,
    },
  ]);

  const [syncEnabled, setSyncEnabled] = useState(true);

  const handleConnect = useCallback((integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === integrationId ? { ...int, connected: true, status: 'active' as const } : int,
      ),
    );
  }, []);

  const handleDisconnect = useCallback((integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((int) => {
        if (int.id === integrationId) {
          const { status: _, ...rest } = int;
          return { ...rest, connected: false };
        }
        return int;
      }),
    );
  }, []);

  const handleSyncChange = useCallback((checked: boolean) => {
    setSyncEnabled(checked);
  }, []);

  return (
    <div className="space-y-6">
      {/* AI設定 */}
      <SettingsCard title="AI設定">
        <div className="space-y-4">
          <div className="bg-surface-container rounded-xl p-4">
            <p className="text-muted-foreground text-sm">
              AIアシスタント機能を使用するには、各プロバイダーのAPIキーを設定してください。
              APIキーはブラウザのローカルストレージに暗号化して保存されます。
            </p>
          </div>

          {AI_PROVIDERS.map((provider) => (
            <div key={provider.id} className="border-border rounded-xl border p-4">
              <div className="flex items-start gap-4">
                <div className="bg-surface-container flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Bot className="text-primary h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{provider.name}</h4>
                    {savedKeys[provider.id] && (
                      <Badge variant="outline" className="text-success gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        保存済み
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{provider.description}</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        placeholder={`${provider.keyPrefix}...`}
                        value={aiKeys[provider.id]}
                        onChange={(e) => handleAiKeyChange(provider.id, e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        onClick={() => toggleKeyVisibility(provider.id)}
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveApiKey(provider.id)}
                      disabled={!aiKeys[provider.id] || savingKeys[provider.id]}
                    >
                      {savingKeys[provider.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        '保存'
                      )}
                    </Button>
                    {savedKeys[provider.id] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApiKey(provider.id)}
                        className="text-destructive hover:text-destructive"
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
      <SettingsCard title="連携サービス">
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="border-border flex items-center justify-between rounded-xl border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-surface-container flex h-10 w-10 items-center justify-center rounded-xl">
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{integration.name}</h4>
                    {integration.connected && (
                      <Badge variant="outline" className="text-success gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        接続済み
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{integration.description}</p>
                </div>
              </div>
              <div>
                {integration.connected ? (
                  <Button variant="outline" onClick={() => handleDisconnect(integration.id)}>
                    <Unplug className="mr-2 h-4 w-4" />
                    解除
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => handleConnect(integration.id)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    接続
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* 同期設定 */}
      <SettingsCard title="同期設定">
        <div className="space-y-4">
          <SettingField
            label="自動同期を有効にする"
            description="連携サービスのデータを自動的に同期します"
          >
            <Switch checked={syncEnabled} onCheckedChange={handleSyncChange} />
          </SettingField>

          {syncEnabled && (
            <div className="bg-surface-container rounded-xl p-4">
              <p className="text-muted-foreground text-sm">
                同期は5分ごとに自動実行されます。手動で同期する場合は各サービスの設定から実行できます。
              </p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* API連携 */}
      <SettingsCard title="API連携">
        <div className="space-y-4">
          <div className="bg-surface-container rounded-xl p-4">
            <p className="text-muted-foreground text-sm">
              APIキーの発行やWebhookの設定は開発者ポータルから行えます。
            </p>
          </div>
          <Button variant="outline" disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            開発者ポータルを開く（準備中）
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
});
