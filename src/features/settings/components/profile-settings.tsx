'use client';

import { useCallback, useState } from 'react';

import { Camera, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChronotypeSettingsPanel as ChronotypeSettings } from '@/features/chronotype';
import { useAuthStore } from '@/stores/useAuthStore';
import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

import { AvatarChangeDialog } from './avatar-change-dialog';
import { DisplayNameDialog } from './display-name-dialog';
import { ValueRankingSettings } from './value-ranking-settings';
import { ValuesSettings } from './values-settings';

/**
 * プロフィール設定コンポーネント
 *
 * アバター、表示名、クロノタイプ、価値観キーワード、価値評定スケール
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
      {/* アバター・表示名 */}
      <SettingsCard title={t('settings.account.profile')}>
        <SettingRow label={t('settings.account.avatar')}>
          <button
            type="button"
            className="group relative cursor-pointer"
            onClick={() => setShowAvatarDialog(true)}
            aria-label={t('settings.account.avatar')}
          >
            <Avatar size="lg">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
              <Camera className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        </SettingRow>
        <SettingRow
          label={t('settings.account.displayName')}
          description={t('settings.account.displayNameDesc')}
        >
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            onClick={() => setShowDisplayNameDialog(true)}
          >
            <span className="text-sm">{displayName}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </SettingRow>
      </SettingsCard>

      {/* クロノタイプ */}
      <ChronotypeSettings />

      {/* 価値観キーワード */}
      <ValueRankingSettings />

      {/* 価値評定スケール */}
      <ValuesSettings />

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
