'use client';

import { useCallback } from 'react';

import { Download, FileJson, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';

import { SettingsCard } from './SettingsCard';

/**
 * データ管理設定コンポーネント
 *
 * エクスポート、インポート（Coming Soon）、全データ削除（Coming Soon）
 */
export function DataSettings() {
  const t = useTranslations();

  const exportDataQuery = api.user.exportData.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = useCallback(async () => {
    try {
      const result = await exportDataQuery.refetch();

      if (!result.data) {
        throw new Error('Export failed');
      }

      const jsonString = JSON.stringify(result.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dayopt-data-export-${result.data.userId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('settings.account.dataExport.success'));
    } catch {
      toast.error(t('settings.account.dataExport.error'));
    }
  }, [exportDataQuery, t]);

  return (
    <div className="space-y-8">
      {/* Data Export */}
      <SettingsCard title={t('settings.dataControls.export.title')}>
        <div className="space-y-4">
          <div className="bg-card border-border rounded-lg border p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-normal">
              <FileJson className="h-4 w-4" />
              {t('settings.dataControls.export.includedDataTitle')}
            </h4>
            <ul className="text-muted-foreground grid grid-cols-2 gap-1 text-sm">
              <li>• {t('settings.dataControls.export.profileInfo')}</li>
              <li>• {t('settings.dataControls.export.tasksEvents')}</li>
              <li>• {t('settings.dataControls.export.tagSettings')}</li>
              <li>• {t('settings.dataControls.export.calendarSettings')}</li>
              <li>• {t('settings.dataControls.export.notificationSettings')}</li>
              <li>• {t('settings.dataControls.export.otherSettings')}</li>
            </ul>
          </div>

          <Button
            onClick={handleExport}
            disabled={exportDataQuery.isLoading || exportDataQuery.isFetching}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {exportDataQuery.isLoading || exportDataQuery.isFetching
              ? t('settings.dataControls.export.exporting')
              : t('settings.dataControls.export.exportButton')}
          </Button>
        </div>
      </SettingsCard>

      {/* Data Import */}
      <SettingsCard title={t('settings.dataControls.import.title')}>
        <div className="space-y-4">
          <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8">
            <Upload className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {t('settings.dataControls.import.dropzone')}
            </p>
            <Button variant="ghost" className="mt-4" disabled>
              {t('settings.dataControls.import.selectFile')}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {t('settings.dataControls.import.comingSoon')}
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}
