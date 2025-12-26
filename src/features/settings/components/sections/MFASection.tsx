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
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
        )}
        {success && (
          <div className="border-success/30 bg-success/5 text-success rounded-lg border p-3 text-sm">
            {success}
          </div>
        )}

        {/* リカバリーコード表示 */}
        {recoveryCodes && (
          <div className="border-warning/30 bg-warning/5 space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="text-warning mb-2 text-lg font-semibold">
                ⚠️ リカバリーコードを保存してください
              </h3>
              <p className="text-muted-foreground text-sm">
                認証アプリにアクセスできなくなった場合、これらのコードでログインできます。
                <strong className="text-foreground"> 各コードは1回のみ使用可能です。</strong>
              </p>
            </div>

            <div className="bg-surface-container grid grid-cols-2 gap-2 rounded-lg p-4 font-mono text-sm">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="text-foreground">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                これらのコードを安全な場所に保存してください。この画面を閉じると再表示できません。
              </p>
              <Button variant="outline" size="sm" onClick={dismissRecoveryCodes}>
                保存しました
              </Button>
            </div>
          </div>
        )}

        {/* MFA未設定時の表示 */}
        {!hasMFA && !showMFASetup && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-medium">Two-Factor Authentication (MFA)</div>
              <p className="text-muted-foreground mt-1 text-sm">
                認証アプリを使って、ログイン時に追加のセキュリティ層を追加します
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={enrollMFA} disabled={isLoading}>
              {isLoading ? '読み込み中...' : 'MFAを有効にする'}
            </Button>
          </div>
        )}

        {/* MFA設定中の表示 */}
        {!hasMFA && showMFASetup && qrCode && (
          <div className="bg-muted space-y-4 rounded-lg p-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">2段階認証を設定</h3>
              <p className="text-muted-foreground text-sm">
                以下の手順に従って、認証アプリで2段階認証を設定してください。
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">1. QRコードをスキャン</p>
                <div className="flex justify-center rounded-lg bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Google Authenticator、Microsoft
                  Authenticator、Authyなどの認証アプリでスキャンしてください
                </p>
              </div>

              {secret && (
                <div>
                  <p className="mb-2 text-sm font-medium">またはこのコードを手動で入力:</p>
                  <code className="bg-surface-container block rounded p-2 text-xs">{secret}</code>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">
                  2. 認証アプリに表示された6桁のコードを入力
                </p>
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
                    {isLoading ? '検証中...' : '確認'}
                  </Button>
                  <Button variant="ghost" onClick={cancelSetup}>
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MFA有効時の表示 */}
        {hasMFA && !recoveryCodes && (
          <div className="space-y-4">
            <div className="border-success/30 bg-success/5 rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-success h-2 w-2 rounded-full"></div>
                <span className="text-success text-sm font-medium">
                  2段階認証が有効になっています
                </span>
              </div>
              <p className="text-success/80 text-xs">
                ログイン時に認証アプリで生成されるコードが必要になります
              </p>
            </div>

            {/* リカバリーコード状態 */}
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">リカバリーコード</div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {recoveryCodeCount > 0 ? (
                      <>残り {recoveryCodeCount} 個のコードが利用可能です</>
                    ) : (
                      <>リカバリーコードがありません</>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateRecoveryCodes}
                  disabled={isLoading}
                >
                  {isLoading ? '生成中...' : '再生成'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="destructive" onClick={disableMFA} disabled={isLoading}>
                {isLoading ? '処理中...' : 'MFAを無効にする'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}
