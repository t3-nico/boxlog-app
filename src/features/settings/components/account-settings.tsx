'use client';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';

import { AccountDeletionDialog } from './account-deletion-dialog';
import { AvatarChangeDialog } from './avatar-change-dialog';
import { DisplayNameDialog } from './display-name-dialog';
import { EmailChangeDialog } from './email-change-dialog';
import { SettingRow } from './fields/SettingRow';
import { PasswordChangeDialog } from './password-change-dialog';
import { MFASection } from './sections/MFASection';
import { SettingsCard } from './SettingsCard';

/**
 * アカウント設定コンポーネント（ChatGPT/Notion風 統一レイアウト）
 *
 * 各項目を1行で表示し、変更はダイアログで行う
 * MFAセクションは複雑な状態を持つため別コンポーネントとして維持
 */
export function AccountSettings() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user);

  // Dialog states
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showDisplayNameDialog, setShowDisplayNameDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // User data
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || '';
  const email = user?.email || '';

  const getInitials = useCallback((name: string) => {
    return name.slice(0, 2).toUpperCase();
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <SettingsCard title={t('settings.account.profile')}>
        <div className="space-y-0">
          <SettingRow
            label={t('settings.account.profilePicture')}
            value={
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            }
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowAvatarDialog(true)}>
                {t('common.change')}
              </Button>
            }
          />
          <SettingRow
            label={t('settings.account.displayName')}
            value={displayName}
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowDisplayNameDialog(true)}>
                {t('common.change')}
              </Button>
            }
            isLast
          />
        </div>
      </SettingsCard>

      {/* Security Section */}
      <SettingsCard title={t('settings.account.email')}>
        <div className="space-y-0">
          <SettingRow
            label={t('settings.account.email')}
            value={email}
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowEmailDialog(true)}>
                {t('common.change')}
              </Button>
            }
          />
          <SettingRow
            label={t('settings.account.password')}
            value="••••••••"
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowPasswordDialog(true)}>
                {t('common.change')}
              </Button>
            }
            isLast
          />
        </div>
      </SettingsCard>

      {/* MFA Section - 複雑な状態を持つため別コンポーネントとして維持 */}
      <MFASection />

      {/* Danger Zone */}
      <SettingsCard
        title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}
        isLast
      >
        <AccountDeletionDialog />
      </SettingsCard>

      {/* Dialogs */}
      <AvatarChangeDialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog} />
      <DisplayNameDialog
        open={showDisplayNameDialog}
        onOpenChange={setShowDisplayNameDialog}
        currentName={displayName}
      />
      <EmailChangeDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        currentEmail={email}
      />
      <PasswordChangeDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </div>
  );
}
