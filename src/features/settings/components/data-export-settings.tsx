'use client';

import { memo, useCallback, useState } from 'react';

import { Download, FileJson, History, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SettingField } from './fields/SettingField';
import { SettingsCard } from './SettingsCard';

export const DataExportSettings = memo(function DataExportSettings() {
  const t = useTranslations();
  const [isExporting, setIsExporting] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      console.info('Data export initiated', {
        component: 'data-export-settings',
      });

      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      // JSON データをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boxlog-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.info('Data export completed', {
        component: 'data-export-settings',
      });

      toast.success(t('settings.account.dataExport.success'));
    } catch (error) {
      console.error('Data export failed', error as Error, {
        component: 'data-export-settings',
      });

      toast.error(t('settings.account.dataExport.error'));
    } finally {
      setIsExporting(false);
    }
  }, [t]);

  const handleAutoBackupChange = useCallback((checked: boolean) => {
    setAutoBackup(checked);
  }, []);

  return (
    <div className="space-y-6">
      {/* データエクスポート */}
      <SettingsCard title="データエクスポート">
        <div className="space-y-4">
          {/* エクスポート対象の説明 */}
          <div className="bg-surface-container rounded-xl p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileJson className="h-4 w-4" />
              エクスポートされるデータ
            </h4>
            <ul className="text-muted-foreground grid grid-cols-2 gap-1 text-sm">
              <li>• プロフィール情報</li>
              <li>• タスク・イベント</li>
              <li>• タグ設定</li>
              <li>• カレンダー設定</li>
              <li>• 通知設定</li>
              <li>• その他の設定</li>
            </ul>
          </div>

          {/* エクスポートボタン */}
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'エクスポート中...' : 'データをエクスポート'}
          </Button>
        </div>
      </SettingsCard>

      {/* データインポート */}
      <SettingsCard title="データインポート">
        <div className="space-y-4">
          <div className="border-border flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8">
            <Upload className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              JSONファイルをドロップまたはクリックして選択
            </p>
            <Button variant="outline" className="mt-4" disabled>
              ファイルを選択
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">※ インポート機能は現在開発中です</p>
        </div>
      </SettingsCard>

      {/* 自動バックアップ */}
      <SettingsCard title="自動バックアップ">
        <div className="space-y-4">
          <SettingField
            label="自動バックアップを有効にする"
            description="毎日自動的にデータをバックアップします"
          >
            <Switch checked={autoBackup} onCheckedChange={handleAutoBackupChange} />
          </SettingField>

          {autoBackup && (
            <div className="bg-surface-container rounded-xl p-4">
              <div className="flex items-center gap-2">
                <History className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">最終バックアップ: 未実行</span>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
});
