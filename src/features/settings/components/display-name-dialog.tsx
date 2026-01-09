'use client';

import { useCallback, useState } from 'react';

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
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface DisplayNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
}

/**
 * 表示名変更ダイアログ
 */
export function DisplayNameDialog({ open, onOpenChange, currentName }: DisplayNameDialogProps) {
  const t = useTranslations();
  const user = useAuthStore((state) => state.user);
  const supabase = createClient();

  const [displayName, setDisplayName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.id) return;
      if (!displayName.trim()) return;

      setIsLoading(true);
      try {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: displayName.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) {
          throw new Error(profileError.message);
        }

        // Update auth metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: { username: displayName.trim() },
        });

        if (authError) {
          console.error('Auth metadata update error:', authError);
        }

        toast.success(t('settings.account.profileUpdated'));
        onOpenChange(false);
      } catch (error) {
        console.error('Display name update error:', error);
        toast.error(t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    },
    [displayName, user?.id, supabase, t, onOpenChange],
  );

  const handleClose = useCallback(() => {
    setDisplayName(currentName);
    onOpenChange(false);
  }, [currentName, onOpenChange]);

  // Reset form when dialog opens
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setDisplayName(currentName);
      }
      onOpenChange(isOpen);
    },
    [currentName, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.account.displayName')}</DialogTitle>
          <DialogDescription>{t('settings.account.displayNameDesc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">{t('settings.account.displayName')}</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('settings.account.displayNamePlaceholder')}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !displayName.trim()}>
              {isLoading ? t('common.loading') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
