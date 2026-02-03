'use client';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useTranslations } from 'next-intl';

import { useMFA } from '../../hooks/useMFA';
import { SettingsCard } from '../SettingsCard';

/**
 * MFA（二段階認証）セクション
 *
 * TOTP認証の登録・管理UIを提供
 */
export function MFASection() {
  const t = useTranslations();
  const {
    hasMFA,
    showMFASetup,
    qrCode,
    secret,
    verificationCode,
    error,
    success,
    isLoading,
    recoveryCodes,
    recoveryCodeCount,
    setVerificationCode,
    enrollMFA,
    verifyMFA,
    disableMFA,
    cancelSetup,
    regenerateRecoveryCodes,
    dismissRecoveryCodes,
  } = useMFA();

  return (
    <SettingsCard title={t('settings.account.twoFactor')} isSaving={isLoading}>
      <div className="space-y-4">
        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-destructive-container text-destructive rounded-2xl p-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="border-success/30 bg-success/5 text-success rounded-2xl border p-3 text-sm">
            {success}
          </div>
        )}

        {/* リカバリーコード表示 */}
        {recoveryCodes && (
          <div className="border-warning/30 bg-warning/5 space-y-4 rounded-2xl border p-4">
            <div>
              <h3 className="text-warning mb-2 text-lg font-bold">
                ⚠️ {t('settings.account.mfa.recoveryCodes.title')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('settings.account.mfa.recoveryCodes.description')}
                <strong className="text-foreground">
                  {' '}
                  {t('settings.account.mfa.recoveryCodes.oneTimeUse')}
                </strong>
              </p>
            </div>

            <div className="bg-surface-container grid grid-cols-2 gap-2 rounded-2xl p-4 font-mono text-sm">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="text-foreground">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                {t('settings.account.mfa.recoveryCodes.saveWarning')}
              </p>
              <Button variant="outline" onClick={dismissRecoveryCodes}>
                {t('settings.account.mfa.recoveryCodes.saved')}
              </Button>
            </div>
          </div>
        )}

        {/* MFA未設定時の表示 */}
        {!hasMFA && !showMFASetup && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-normal">{t('settings.account.mfa.title')}</div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('settings.account.mfa.description')}
              </p>
            </div>
            <Button type="button" onClick={enrollMFA} disabled={isLoading}>
              {isLoading ? t('settings.account.mfa.loading') : t('settings.account.mfa.enableMFA')}
            </Button>
          </div>
        )}

        {/* MFA設定中の表示 */}
        {!hasMFA && showMFASetup && qrCode && (
          <div className="bg-muted space-y-4 rounded-2xl p-6">
            <div>
              <h3 className="mb-2 text-lg font-bold">{t('settings.account.mfa.setup.title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('settings.account.mfa.setup.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-normal">{t('settings.account.mfa.setup.step1')}</p>
                <div className="flex justify-center rounded-2xl bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {t('settings.account.mfa.setup.step1Desc')}
                </p>
              </div>

              {secret && (
                <div>
                  <p className="mb-2 text-sm font-normal">
                    {t('settings.account.mfa.setup.manualEntry')}
                  </p>
                  <code className="bg-surface-container block rounded p-2 text-xs">{secret}</code>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-normal">{t('settings.account.mfa.setup.step2')}</p>
                <div className="flex items-center gap-4">
                  <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <Button onClick={verifyMFA} disabled={isLoading || verificationCode.length !== 6}>
                    {isLoading
                      ? t('settings.account.mfa.verifying')
                      : t('settings.account.mfa.verify')}
                  </Button>
                  <Button variant="ghost" onClick={cancelSetup}>
                    {t('settings.account.mfa.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MFA有効時の表示 */}
        {hasMFA && !recoveryCodes && (
          <div className="space-y-4">
            <div className="border-success/30 bg-success/5 rounded-2xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-success h-2 w-2 rounded-full"></div>
                <span className="text-success text-sm font-normal">
                  {t('settings.account.mfa.enabled.title')}
                </span>
              </div>
              <p className="text-success/80 text-xs">
                {t('settings.account.mfa.enabled.description')}
              </p>
            </div>

            {/* リカバリーコード状態 */}
            <div className="bg-muted rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-normal">
                    {t('settings.account.mfa.recoveryCodes.sectionTitle')}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {recoveryCodeCount > 0
                      ? t('settings.account.mfa.recoveryCodes.remaining', {
                          count: recoveryCodeCount,
                        })
                      : t('settings.account.mfa.recoveryCodes.noCodesLeft')}
                  </p>
                </div>
                <Button onClick={regenerateRecoveryCodes} disabled={isLoading}>
                  {isLoading
                    ? t('settings.account.mfa.generating')
                    : t('settings.account.mfa.regenerate')}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={disableMFA} disabled={isLoading}>
                {isLoading
                  ? t('settings.account.mfa.processing')
                  : t('settings.account.mfa.disableMFA')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}
