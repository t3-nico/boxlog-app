'use client'

import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useTranslations } from 'next-intl'

import { useMFA } from '../../hooks/useMFA'
import { SettingsCard } from '../SettingsCard'

/**
 * MFA（二段階認証）セクション
 *
 * TOTP認証の登録・管理UIを提供
 */
export function MFASection() {
  const t = useTranslations()
  const {
    hasMFA,
    showMFASetup,
    qrCode,
    secret,
    verificationCode,
    error,
    success,
    isLoading,
    setVerificationCode,
    enrollMFA,
    verifyMFA,
    disableMFA,
    cancelSetup,
  } = useMFA()

  return (
    <SettingsCard title={t('settings.account.twoFactor')} isSaving={isLoading}>
      <div className="space-y-4">
        {/* エラー・成功メッセージ */}
        {error && (
          <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-700 dark:text-green-400">
            {success}
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
            <Button type="button" variant="outline" onClick={enrollMFA} disabled={isLoading}>
              {isLoading ? '読み込み中...' : 'MFAを有効にする'}
            </Button>
          </div>
        )}

        {/* MFA設定中の表示 */}
        {!hasMFA && showMFASetup && qrCode && (
          <div className="border-border bg-card space-y-4 rounded-lg border p-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">2段階認証を設定</h3>
              <p className="text-muted-foreground text-sm">
                以下の手順に従って、認証アプリで2段階認証を設定してください。
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">1. QRコードをスキャン</p>
                <div className="border-border flex justify-center rounded-lg border bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Google Authenticator、Microsoft Authenticator、Authyなどの認証アプリでスキャンしてください
                </p>
              </div>

              {secret && (
                <div>
                  <p className="mb-2 text-sm font-medium">またはこのコードを手動で入力:</p>
                  <code className="bg-muted block rounded p-2 text-xs">{secret}</code>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">2. 認証アプリに表示された6桁のコードを入力</p>
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
                  <Button variant="outline" onClick={cancelSetup}>
                    キャンセル
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MFA有効時の表示 */}
        {hasMFA && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  2段階認証が有効になっています
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500">
                ログイン時に認証アプリで生成されるコードが必要になります
              </p>
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
  )
}
