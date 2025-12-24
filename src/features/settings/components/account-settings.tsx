'use client'

import { DangerZoneSection, EmailSection, LogoutSection, MFASection, PasswordSection, ProfileSection } from './sections'

/**
 * アカウント設定コンポーネント
 *
 * 各セクションは独立したコンポーネントとして分割
 * - ProfileSection: アバター、ユーザー名
 * - EmailSection: メールアドレス
 * - PasswordSection: パスワード変更
 * - MFASection: 二段階認証
 * - LogoutSection: ログアウト
 * - DangerZoneSection: アカウント削除
 */
export function AccountSettings() {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <EmailSection />
      <PasswordSection />
      <MFASection />
      <LogoutSection />
      <DangerZoneSection />
    </div>
  )
}
