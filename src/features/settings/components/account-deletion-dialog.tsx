'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

/**
 * 🗑️ Account Deletion Dialog Component
 *
 * GDPR "Right to be Forgotten" 準拠のアカウント削除確認ダイアログ
 * - パスワード確認
 * - 確認テキスト入力（"DELETE"）
 * - 30日間の猶予期間通知
 *
 * @see Issue #548 - データ削除リクエスト機能（忘れられる権利）
 */
export function AccountDeletionDialog() {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const deleteAccountMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: (data) => {
      console.info('Account deletion scheduled', {
        component: 'account-deletion-dialog',
        scheduledDate: data.scheduledDeletionDate,
      });

      toast.success(t('settings.account.deletion.success'));
      setIsOpen(false);

      // 5秒後にログアウトページへリダイレクト
      setTimeout(() => {
        window.location.href = '/auth/signout';
      }, 5000);
    },
    onError: (error) => {
      console.error('Account deletion failed', error, {
        component: 'account-deletion-dialog',
      });

      if (error.message.includes('Invalid password')) {
        toast.error(t('settings.account.deletion.invalidPassword'));
      } else {
        toast.error(error.message || t('settings.account.deletion.error'));
      }
    },
  });

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error(t('settings.account.deletion.confirmTextError'));
      return;
    }

    if (!password) {
      toast.error(t('settings.account.deletion.passwordRequired'));
      return;
    }

    console.info('Account deletion initiated', {
      component: 'account-deletion-dialog',
    });

    deleteAccountMutation.mutate({
      password,
      confirmText: 'DELETE',
    });
  };

  return (
    <>
      <div className="bg-destructive/10 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-destructive h-2 w-2 animate-pulse rounded-full"></div>
              <div className="text-destructive font-medium">
                {t('settings.account.deletion.title')}
              </div>
            </div>
            <p className="text-destructive text-sm leading-relaxed">
              ⚠️ <strong>{t('settings.account.deletion.warningTitle')}</strong>
              <br />
              {t('settings.account.deletion.warningMessage')}
            </p>
            <ul className="text-destructive ml-4 space-y-1 text-xs">
              <li>• {t('settings.account.deletion.consequence1')}</li>
              <li>• {t('settings.account.deletion.consequence2')}</li>
              <li>• {t('settings.account.deletion.consequence3')}</li>
            </ul>
          </div>
          <Button
            type="button"
            onClick={() => setIsOpen(true)}
            variant="destructive"
            className="ml-4"
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending
              ? t('settings.account.deletion.deleting')
              : `🗑️ ${t('settings.account.deletion.buttonText')}`}
          </Button>
        </div>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-5 w-5" />
              {t('settings.account.deletion.dialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>{t('settings.account.deletion.dialogDescription')}</p>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-foreground mb-2 text-sm font-semibold">
                  {t('settings.account.deletion.gracePeriodTitle')}
                </h4>
                <p className="text-xs">{t('settings.account.deletion.gracePeriodMessage')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  {t('settings.account.deletion.passwordLabel')}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('settings.account.deletion.passwordPlaceholder')}
                  disabled={deleteAccountMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  {t('settings.account.deletion.confirmTextLabel')}
                </label>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  disabled={deleteAccountMutation.isPending}
                />
                <p className="text-muted-foreground text-xs">
                  {t('settings.account.deletion.confirmTextHint')}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
              {t('settings.account.deletion.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteAccountMutation.isPending || !password || confirmText !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive-hover"
            >
              {deleteAccountMutation.isPending
                ? t('settings.account.deletion.deleting')
                : t('settings.account.deletion.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
