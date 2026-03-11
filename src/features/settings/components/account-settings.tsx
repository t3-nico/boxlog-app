'use client';

import { Suspense, lazy, useCallback, useState } from 'react';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from '@/i18n/navigation';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';

import { AccountDeletionDialog } from './account-deletion-dialog';
import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

const PlanBillingSettings = lazy(() =>
  import('./plan-billing-settings').then((m) => ({ default: m.PlanBillingSettings })),
);

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/**
 * アカウント設定コンポーネント
 *
 * プラン・お支払い、ログアウト、アカウント削除
 */
export function AccountSettings() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success(t('navUser.logoutSuccess'));
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      logger.error('Logout error:', error);
      toast.error(t('navUser.logoutFailed'));
    } finally {
      setIsLoggingOut(false);
    }
  }, [t, router]);

  return (
    <div className="space-y-8">
      {/* Plan & Billing */}
      <Suspense fallback={<SectionSkeleton />}>
        <PlanBillingSettings />
      </Suspense>

      {/* Logout */}
      <SettingsCard title={t('settings.account.session')}>
        <SettingRow label={t('navUser.logout')}>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
          </Button>
        </SettingRow>
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard
        title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}
      >
        <AccountDeletionDialog />
      </SettingsCard>
    </div>
  );
}
