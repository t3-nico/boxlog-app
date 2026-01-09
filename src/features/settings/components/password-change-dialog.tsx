'use client';

import { useCallback, useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { addPasswordToHistory, isPasswordReused } from '@/lib/auth/password-history';
import { checkPasswordPwned } from '@/lib/auth/pwned-password';
import { createClient } from '@/lib/supabase/client';

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * パスワード変更ダイアログ
 *
 * OWASP/NIST推奨のセキュリティチェックを含む
 */
export function PasswordChangeDialog({ open, onOpenChange }: PasswordChangeDialogProps) {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations();
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onOpenChange(false);
  }, [onOpenChange, resetForm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation
      if (newPassword !== confirmPassword) {
        setError(t('settings.account.passwordMismatch'));
        return;
      }
      if (newPassword.length < 8) {
        setError(t('settings.account.passwordMinLength'));
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        // Step 1: Re-authenticate with current password
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

        // Step 2: Password history check (OWASP)
        if (!user?.id) {
          throw new Error(t('errors.auth.userIdNotFound'));
        }

        const isReused = await isPasswordReused(user.id, newPassword);
        if (isReused) {
          throw new Error(t('settings.account.passwordReused'));
        }

        // Step 3: Pwned password check (NIST)
        const isPwned = await checkPasswordPwned(newPassword);
        if (isPwned) {
          throw new Error(t('settings.account.passwordPwned'));
        }

        // Step 4: Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Step 5: Add to password history
        await addPasswordToHistory(user.id, newPassword);

        // Step 6: Sign out other sessions
        await supabase.auth.signOut({ scope: 'others' });

        setSuccess(true);
      } catch (err) {
        console.error('Password update error:', err);
        const errorMessage =
          err instanceof Error ? err.message : t('settings.account.passwordUpdateFailed');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, user?.email, user?.id, t, supabase],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.account.password')}</DialogTitle>
          <DialogDescription>
            {success ? t('settings.account.passwordUpdated') : t('settings.account.passwordDesc')}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-4">
            <div className="border-success/30 bg-success/5 rounded-xl p-4">
              <p className="text-success text-sm font-medium">
                {t('settings.account.passwordUpdated')}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t('settings.account.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={64}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{t('settings.account.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={64}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  {t('settings.account.passwordMinLength')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('settings.account.confirmPassword')}</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={64}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive-container text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t('settings.account.updatingPassword')
                  : t('settings.account.updatePassword')}
              </Button>
            </DialogFooter>
          </form>
        )}

        {success && (
          <DialogFooter>
            <Button onClick={handleClose}>{t('common.close')}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
