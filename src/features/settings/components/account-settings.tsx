'use client';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Camera } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';

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
    <div className="space-y-8">
      {/* Profile Section */}
      <SettingsCard title={t('settings.account.profile')}>
        <div className="mb-4">
          <div className="text-foreground mb-2 text-base">
            {t('settings.account.profilePicture')}
          </div>
          <button
            type="button"
            className="group relative cursor-pointer"
            onClick={() => setShowAvatarDialog(true)}
            aria-label={t('settings.account.profilePicture')}
          >
            <Avatar size="xl">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
              <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        </div>
        <div className="space-y-0">
          <SettingRow label={t('settings.account.displayName')} description={displayName}>
            <Button variant="outline" onClick={() => setShowDisplayNameDialog(true)}>
              {t('common.change')}
            </Button>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* Security Section */}
      <SettingsCard title={t('settings.account.email')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.account.email')} description={email}>
            <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
              {t('common.change')}
            </Button>
          </SettingRow>
          <SettingRow label={t('settings.account.password')} description="••••••••">
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              {t('common.change')}
            </Button>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* MFA Section - 複雑な状態を持つため別コンポーネントとして維持 */}
      <MFASection />

      {/* Danger Zone */}
      <SettingsCard
        title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}
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
