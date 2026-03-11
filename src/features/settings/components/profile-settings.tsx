'use client';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Camera } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChronotypeSettingsPanel as ChronotypeSettings } from '@/features/chronotype';
import { useAuthStore } from '@/stores/useAuthStore';

import { SettingRow } from '@/components/common/SettingRow';
import { SettingsCard } from '@/components/common/SettingsCard';
import { AvatarChangeDialog } from './avatar-change-dialog';
import { DisplayNameDialog } from './display-name-dialog';
import { ValueRankingSettings } from './value-ranking-settings';
import { ValuesSettings } from './values-settings';

/**
 * プロフィール設定コンポーネント
 *
 * 名前、メール、クロノタイプを管理
 */
export function ProfileSettings() {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user);

  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showDisplayNameDialog, setShowDisplayNameDialog] = useState(false);

  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || '';

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

      {/* Values Section */}
      <ValuesSettings />
      <ValueRankingSettings />

      {/* Chronotype Section */}
      <ChronotypeSettings />

      {/* Dialogs */}
      <AvatarChangeDialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog} />
      <DisplayNameDialog
        open={showDisplayNameDialog}
        onOpenChange={setShowDisplayNameDialog}
        currentName={displayName}
      />
    </div>
  );
}
