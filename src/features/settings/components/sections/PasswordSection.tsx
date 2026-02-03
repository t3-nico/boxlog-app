'use client';

import { useCallback, useState } from 'react';

import { Eye, EyeOff, InfoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { addPasswordToHistory, isPasswordReused } from '@/lib/auth/password-history';
import { checkPasswordPwned } from '@/lib/auth/pwned-password';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

import { SettingsCard } from '../SettingsCard';

/**
 * パスワード変更セクション
 *
 * OWASP/NIST推奨のセキュリティチェックを含む
 * - 現在のパスワード検証
 * - パスワード履歴チェック
 * - 漏洩パスワードチェック（Have I Been Pwned）
 */
export function PasswordSection() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations();
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // バリデーション
      if (newPassword !== confirmPassword) {
        setPasswordError(t('settings.account.passwordMismatch'));
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError(t('settings.account.passwordMinLength'));
        return;
      }

      setPasswordError(null);
      setIsLoading(true);

      try {
        // ステップ1: 現在のパスワードで再認証
        if (!user?.email) {
          throw new Error(t('errors.auth.emailNotFound'));
        }

        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (reAuthError) {
          throw new Error(t('settings.account.passwordIncorrect'));
        }

        // ステップ2: パスワード履歴チェック（OWASP推奨）
        if (!user?.id) {
          throw new Error(t('errors.auth.userIdNotFound'));
        }

        const isReused = await isPasswordReused(user.id, newPassword);
        if (isReused) {
          throw new Error(t('settings.account.passwordReused'));
        }

        // ステップ3: 漏洩パスワードチェック（NIST推奨）
        const isPwned = await checkPasswordPwned(newPassword);
        if (isPwned) {
          throw new Error(t('settings.account.passwordPwned'));
        }

        // ステップ4: パスワード更新
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          throw new Error(error.message);
        }

        // ステップ5: パスワード履歴に追加
        await addPasswordToHistory(user.id, newPassword);

        // ステップ6: 他のデバイスのセッションを無効化
        await supabase.auth.signOut({ scope: 'others' });

        // 成功時はフォームをリセット
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        alert(t('settings.account.passwordUpdated'));
      } catch (err) {
        console.error('Password update error:', err);
        const errorMessage =
          err instanceof Error ? err.message : t('settings.account.passwordUpdateFailed');
        setPasswordError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, user?.email, user?.id, t, supabase],
  );

  const handleCurrentPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
  }, []);

  const handleNewPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }, []);

  const toggleCurrentPasswordVisibility = useCallback(() => {
    setShowCurrentPassword((prev) => !prev);
  }, []);

  const toggleNewPasswordVisibility = useCallback(() => {
    setShowNewPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  return (
    <SettingsCard title={t('settings.account.password')}>
      <form onSubmit={handlePasswordSave} className="space-y-2">
        <InputGroup>
          <InputGroupInput
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            placeholder={t('settings.account.currentPassword')}
            required
            minLength={8}
            maxLength={64}
          />
          <InputGroupAddon align="inline-end">
            <HoverTooltip
              content={showCurrentPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              side="top"
              delayMs={0}
            >
              <InputGroupButton
                variant="ghost"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                size="icon-sm"
                onClick={toggleCurrentPasswordVisibility}
              >
                {showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </InputGroupButton>
            </HoverTooltip>
            <HoverTooltip content="現在のパスワードを入力してください" side="top" delayMs={0}>
              <InputGroupButton variant="ghost" aria-label="Info" size="icon-sm">
                <InfoIcon />
              </InputGroupButton>
            </HoverTooltip>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputGroupInput
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder={t('settings.account.newPassword')}
            required
            minLength={8}
            maxLength={64}
          />
          <InputGroupAddon align="inline-end">
            <HoverTooltip
              content={showNewPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              side="top"
              delayMs={0}
            >
              <InputGroupButton
                variant="ghost"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                size="icon-sm"
                onClick={toggleNewPasswordVisibility}
              >
                {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </InputGroupButton>
            </HoverTooltip>
            <HoverTooltip content={t('settings.account.passwordMinLength')} side="top" delayMs={0}>
              <InputGroupButton variant="ghost" aria-label="Info" size="icon-sm">
                <InfoIcon />
              </InputGroupButton>
            </HoverTooltip>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputGroupInput
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder={t('settings.account.confirmPassword')}
            required
            minLength={8}
            maxLength={64}
          />
          <InputGroupAddon align="inline-end">
            <HoverTooltip
              content={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
              side="top"
              delayMs={0}
            >
              <InputGroupButton
                variant="ghost"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                size="icon-sm"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </InputGroupButton>
            </HoverTooltip>
            <HoverTooltip content="新しいパスワードを再入力してください" side="top" delayMs={0}>
              <InputGroupButton variant="ghost" aria-label="Info" size="icon-sm">
                <InfoIcon />
              </InputGroupButton>
            </HoverTooltip>
          </InputGroupAddon>
        </InputGroup>

        {passwordError ? <p className="text-destructive text-sm">{passwordError}</p> : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t('settings.account.updatingPassword')
              : t('settings.account.updatePassword')}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
