'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useTranslations } from 'next-intl';

import { EmailChangeDialog } from '../email-change-dialog';
import { SettingsCard } from '../SettingsCard';

/**
 * メールセクション
 *
 * 現在のメールアドレス表示とメール変更ダイアログ
 */
export function EmailSection() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations();
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  const email = user?.email || '';

  return (
    <>
      <SettingsCard title={t('settings.account.email')}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2 text-xs">
              {t('settings.account.emailUsedFor')}
            </p>
            <p className="text-sm font-medium">{email}</p>
            <p className="text-muted-foreground text-xs">{t('settings.account.emailVerified')}</p>
          </div>
          <Button type="button" variant="ghost" onClick={() => setShowEmailDialog(true)}>
            {t('common.change')}
          </Button>
        </div>
      </SettingsCard>

      <EmailChangeDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        currentEmail={email}
      />
    </>
  );
}
