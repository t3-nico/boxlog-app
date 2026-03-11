'use client';

import { useCallback, useState } from 'react';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { useRouter } from '@/platform/i18n/navigation';
import { createClient } from '@/platform/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

import { SettingRow } from '@/components/common/SettingRow';
import { SettingsCard } from '@/components/common/SettingsCard';
import { AccountDeletionDialog } from './account-deletion-dialog';
import { EmailChangeDialog } from './email-change-dialog';
import { PasswordChangeDialog } from './password-change-dialog';

/**
 * アカウント設定コンポーネント
 *
 * メール、パスワード、ソーシャルログイン、ログアウト、アカウント削除
 */
export function AccountSettings() {
  const t = useTranslations();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const email = user?.email || '';

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
      {/* メールアドレス */}
      <SettingsCard title={t('settings.account.email')}>
        <SettingRow label={email}>
          <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
            {t('common.change')}
          </Button>
        </SettingRow>
      </SettingsCard>

      {/* パスワード */}
      <SettingsCard title={t('settings.account.password')}>
        <SettingRow label="••••••••">
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
            {t('common.change')}
          </Button>
        </SettingRow>
      </SettingsCard>

      {/* ソーシャルログイン連携 */}
      <SettingsCard title={t('settings.account.socialLogin')}>
        <SettingRow label="Google" description={t('settings.account.notConnected')}>
          <Button variant="outline" disabled>
            {t('settings.account.connect')}
          </Button>
        </SettingRow>
        <SettingRow label="Apple" description={t('settings.account.notConnected')}>
          <Button variant="outline" disabled>
            {t('settings.account.connect')}
          </Button>
        </SettingRow>
        <SettingRow label="Meta" description={t('settings.account.notConnected')}>
          <Button variant="outline" disabled>
            {t('settings.account.connect')}
          </Button>
        </SettingRow>
        <p className="text-muted-foreground text-xs">
          <Badge variant="secondary" className="mr-1">
            {t('settings.account.comingSoon')}
          </Badge>
          {t('settings.account.socialLoginDesc')}
        </p>
      </SettingsCard>

      {/* セッション */}
      <SettingsCard title={t('settings.account.session')}>
        <SettingRow label={t('navUser.logout')}>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
          </Button>
        </SettingRow>
      </SettingsCard>

      {/* 危険な操作 */}
      <SettingsCard
        title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}
      >
        <AccountDeletionDialog />
      </SettingsCard>

      {/* Dialogs */}
      <EmailChangeDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        currentEmail={email}
      />
      <PasswordChangeDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </div>
  );
}
