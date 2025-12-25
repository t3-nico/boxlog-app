'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';

import { AvatarDropzone } from '@/components/ui/avatar-dropzone';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { deleteAvatar, uploadAvatar } from '@/lib/supabase/storage';

import { useAutoSaveSettings } from '../../hooks/useAutoSaveSettings';
import { SettingField } from '../fields/SettingField';
import { SettingsCard } from '../SettingsCard';

interface ProfileSettings {
  username: string;
  email: string;
  uploadedAvatar: string | null;
}

/**
 * プロフィールセクション
 *
 * アバター画像とユーザー名の編集
 */
export function ProfileSection() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations();
  const supabase = createClient();

  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const profile = useAutoSaveSettings<ProfileSettings>({
    initialValues: {
      username: user?.user_metadata?.username || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      uploadedAvatar: user?.user_metadata?.avatar_url || null,
    },
    onSave: async (values) => {
      if (!user?.id) {
        throw new Error(t('errors.auth.userIdNotFound'));
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          avatar_url: values.uploadedAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        throw new Error(`${t('errors.auth.profileUpdateFailed')}: ${profileError.message}`);
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: values.username,
          avatar_url: values.uploadedAvatar,
        },
      });

      if (authError) {
        console.error('Auth metadata update error:', authError);
      }
    },
    successMessage: t('settings.account.profileUpdated'),
    debounceMs: 1000,
  });

  // ユーザー情報を初期値として設定
  useEffect(() => {
    if (user) {
      profile.updateValues({
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        uploadedAvatar: user.user_metadata?.avatar_url || null,
      });
      setUploadedAvatar(user.user_metadata?.avatar_url || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!user?.id) return;

      setIsUploading(true);
      try {
        const publicUrl = await uploadAvatar(file, user.id);
        setUploadedAvatar(publicUrl);
        profile.updateValue('uploadedAvatar', publicUrl);
      } catch (error) {
        console.error('Avatar upload error:', error);
        throw error; // AvatarDropzone側でエラー表示
      } finally {
        setIsUploading(false);
      }
    },
    [profile, user?.id],
  );

  const handleAvatarRemove = useCallback(async () => {
    if (!user?.id) return;

    setIsUploading(true);
    try {
      await deleteAvatar(user.id);
      setUploadedAvatar(null);
      profile.updateValue('uploadedAvatar', null);
    } catch (error) {
      console.error('Avatar delete error:', error);
      throw error; // AvatarDropzone側でエラー表示
    } finally {
      setIsUploading(false);
    }
  }, [profile, user?.id]);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      profile.updateValue('username', e.target.value);
    },
    [profile],
  );

  return (
    <SettingsCard title={t('settings.account.profile')} isSaving={profile.isSaving}>
      <div className="space-y-6">
        {/* Profile Picture Section */}
        <SettingField label={t('settings.account.profilePicture')}>
          <AvatarDropzone
            currentAvatarUrl={uploadedAvatar}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
            isUploading={isUploading}
            size={96}
          />
        </SettingField>

        <SettingField label="ユーザー名" description="アプリ内で表示される名前です" required>
          <Input
            value={profile.values.username}
            onChange={handleUsernameChange}
            placeholder="username"
            required
          />
        </SettingField>
      </div>
    </SettingsCard>
  );
}
