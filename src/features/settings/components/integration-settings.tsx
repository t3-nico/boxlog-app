'use client'

import { memo, useCallback, useState } from 'react'

import { Calendar, CheckCircle2, ExternalLink, MessageSquare, Unplug } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  connected: boolean
  status?: 'active' | 'inactive' | 'error'
}

export const IntegrationSettings = memo(function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Googleカレンダーと予定を同期します',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Slackにリマインダーや通知を送信します',
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      connected: false,
    },
  ])

  const [syncEnabled, setSyncEnabled] = useState(true)

  const handleConnect = useCallback((integrationId: string) => {
    // TODO: 実際のOAuth連携を実装
    setIntegrations((prev) =>
      prev.map((int) => (int.id === integrationId ? { ...int, connected: true, status: 'active' as const } : int))
    )
  }, [])

  const handleDisconnect = useCallback((integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((int) => (int.id === integrationId ? { ...int, connected: false, status: undefined } : int))
    )
  }, [])

  const handleSyncChange = useCallback((checked: boolean) => {
    setSyncEnabled(checked)
  }, [])

  return (
    <div className="space-y-6">
      {/* 連携サービス一覧 */}
      <SettingsCard title="連携サービス" description="外部サービスと接続してBoxLogの機能を拡張できます">
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border-border flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">{integration.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{integration.name}</h4>
                    {integration.connected && (
                      <Badge variant="outline" className="gap-1 text-green-600">
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
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(integration.id)}>
                    <Unplug className="mr-2 h-4 w-4" />
                    解除
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => handleConnect(integration.id)}>
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
      <SettingsCard title="同期設定" description="連携サービスとのデータ同期を管理します">
        <div className="space-y-4">
          <SettingField label="自動同期を有効にする" description="連携サービスのデータを自動的に同期します">
            <Switch checked={syncEnabled} onCheckedChange={handleSyncChange} />
          </SettingField>

          {syncEnabled && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">
                同期は5分ごとに自動実行されます。手動で同期する場合は各サービスの設定から実行できます。
              </p>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* API連携 */}
      <SettingsCard title="API連携" description="開発者向けのAPI連携オプション">
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">APIキーの発行やWebhookの設定は開発者ポータルから行えます。</p>
          </div>
          <Button variant="outline" disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            開発者ポータルを開く（準備中）
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
})
