/**
 * Email Templates Storybook Stories
 *
 * React Email は完全な HTML文書を生成するため、
 * render() で HTML文字列に変換し iframe の srcDoc で表示する。
 */

import { useEffect, useState } from 'react';

import { render } from '@react-email/render';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccountDeletionEmail } from './AccountDeletionEmail';
import { ConfirmEmail } from './ConfirmEmail';
import { MagicLinkEmail } from './MagicLinkEmail';
import { OverdueEmail } from './OverdueEmail';
import { PasswordResetEmail } from './PasswordResetEmail';
import { ReminderEmail } from './ReminderEmail';
import { colors } from './styles';
import { WelcomeEmail } from './WelcomeEmail';

const meta = {
  title: 'Docs/Email',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * React Email を iframe でプレビュー（render() が async のため state で管理）
 */
function EmailPreview({ element, title }: { element: React.ReactElement; title: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    render(element).then(setHtml);
  }, [element]);

  if (!html) {
    return <p className="p-4 text-sm">Loading...</p>;
  }

  return (
    <div className="p-4">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <iframe
        title={title}
        srcDoc={html}
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid var(--border)',
          borderRadius: '8px',
        }}
      />
    </div>
  );
}

/** ガイドライン: テンプレート仕様とカラートークン */
export const Guidelines: Story = {
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Email Templates</h1>
        <p className="text-muted-foreground">Resend + React Email で管理するメールテンプレート。</p>
      </div>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">構成</h2>
        <div className="text-muted-foreground space-y-1 font-mono text-sm">
          <p>src/emails/</p>
          <p className="pl-4">styles.ts — 共通スタイル（globals.css トークン → hex）</p>
          <p className="pl-4">WelcomeEmail.tsx — 新規登録</p>
          <p className="pl-4">ConfirmEmail.tsx — メール確認（Auth）</p>
          <p className="pl-4">PasswordResetEmail.tsx — PW リセット（Auth）</p>
          <p className="pl-4">MagicLinkEmail.tsx — マジックリンク（Auth）</p>
          <p className="pl-4">ReminderEmail.tsx — プランリマインダー</p>
          <p className="pl-4">OverdueEmail.tsx — 期限超過</p>
          <p className="pl-4">AccountDeletionEmail.tsx — アカウント削除（GDPR）</p>
        </div>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">カラートークン</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          メールクライアントは CSS変数・OKLCH 未対応のため、globals.css トークンを hex に変換。
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Object.entries(colors).map(([name, hex]) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className="border-border size-8 shrink-0 rounded border"
                style={{ backgroundColor: hex }}
              />
              <div>
                <code className="text-xs font-bold">{name}</code>
                <p className="text-muted-foreground text-xs">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">
          テンプレートと tRPC エンドポイント
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="py-3 text-left font-bold">テンプレート</th>
                <th className="py-3 text-left font-bold">用途</th>
                <th className="py-3 text-left font-bold">トリガー</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['WelcomeEmail', '新規登録', 'email.sendWelcome'],
                ['ConfirmEmail', 'メール確認', 'Supabase Auth hook (signup)'],
                ['PasswordResetEmail', 'PW リセット', 'Supabase Auth hook (recovery)'],
                ['MagicLinkEmail', 'マジックリンク', 'Supabase Auth hook (magic_link)'],
                ['ReminderEmail', 'リマインダー', 'email.sendReminder'],
                ['OverdueEmail', '期限超過', 'email.sendOverdue'],
                ['AccountDeletionEmail', 'アカウント削除', 'email.sendAccountDeletion'],
              ].map(([name, use, trigger]) => (
                <tr key={name} className="border-border border-b">
                  <td className="py-3">
                    <code>{name}</code>
                  </td>
                  <td className="py-3">{use}</td>
                  <td className="py-3">
                    <code className="text-xs">{trigger}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">デザインルール</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-sm">
          <li>
            全テンプレートで <code>src/emails/styles.ts</code> の共通スタイルを使用
          </li>
          <li>メールはライトモード固定（ダークモード未対応）</li>
          <li>CTA ボタンは1メールにつき1つ（明確なアクション）</li>
          <li>フッターに通知設定リンクを含める（Reminder/Overdue）</li>
          <li>パスワードリセット等はフォールバックURL（コピペ用）を表示</li>
          <li>maxWidth: 580px（モバイル表示を考慮）</li>
        </ul>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">Resend インフラ構成</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="py-3 text-left font-bold">項目</th>
                <th className="py-3 text-left font-bold">設定値</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['送信ドメイン', 'send.dayopt.app（Resend verified）'],
                ['送信元アドレス', 'noreply@send.dayopt.app'],
                ['DNS レコード', 'DKIM + SPF + MX（Vercel DNS）'],
                ['DMARC', 'v=DMARC1; p=none（監視モード）'],
                ['Webhook URL', '/api/webhooks/resend'],
                ['本番 API キー', 'Sending Access（send.dayopt.app のみ）'],
                ['開発 API キー', 'Full Access（テスト送信用）'],
              ].map(([item, value]) => (
                <tr key={item} className="border-border border-b">
                  <td className="py-3">
                    <code className="text-xs">{item}</code>
                  </td>
                  <td className="py-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">送信フロー</h2>
        <div className="text-muted-foreground space-y-4 text-sm">
          <div>
            <h3 className="text-foreground mb-2 text-sm font-bold">
              Auth メール（signup / reset / magic_link）
            </h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-xs">
              <p>Supabase Auth → send_email hook → Edge Function</p>
              <p className="pl-4">→ supabase/functions/send-auth-email/index.ts</p>
              <p className="pl-4">→ Resend API → ユーザー</p>
            </div>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-sm font-bold">
              アプリメール（welcome / reminder / overdue / deletion）
            </h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-xs">
              <p>App → tRPC email.sendXxx → React Email render</p>
              <p className="pl-4">→ src/server/api/routers/email.ts</p>
              <p className="pl-4">→ Resend API → ユーザー</p>
            </div>
          </div>
          <div>
            <h3 className="text-foreground mb-2 text-sm font-bold">Webhook（配信結果の監視）</h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-xs">
              <p>Resend → POST /api/webhooks/resend → ログ記録</p>
              <p className="pl-4">→ src/app/api/webhooks/resend/route.ts</p>
              <p className="pl-4">→ bounced / complained / delivered / delayed</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">環境変数</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="py-3 text-left font-bold">変数名</th>
                <th className="py-3 text-left font-bold">用途</th>
                <th className="py-3 text-left font-bold">設定場所</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['RESEND_API_KEY', 'Resend API キー', 'Vercel + .env.local'],
                ['RESEND_FROM_EMAIL', '送信元アドレス', 'Vercel + .env.local'],
                ['RESEND_WEBHOOK_SECRET', 'Webhook 署名検証シークレット', 'Vercel + .env.local'],
              ].map(([name, purpose, where]) => (
                <tr key={name} className="border-border border-b">
                  <td className="py-3">
                    <code className="text-xs">{name}</code>
                  </td>
                  <td className="py-3">{purpose}</td>
                  <td className="py-3">{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="border-border mb-4 border-b pb-2 text-lg font-bold">セキュリティ</h2>
        <ul className="text-muted-foreground list-disc space-y-2 pl-6 text-sm">
          <li>
            本番は <strong>Sending Access</strong> キー（ドメイン管理不可、送信のみ）
          </li>
          <li>
            tRPC mutation は <code>verifyEmailOwnership()</code> で送信先を自分のアドレスに制限
          </li>
          <li>
            Webhook は <strong>svix 署名検証</strong>で改ざん防止
          </li>
          <li>テストメール endpoint は本番環境で無効化</li>
          <li>DMARC で送信ドメインのなりすましを監視</li>
        </ul>
      </section>
    </div>
  ),
};

/** ウェルカムメール */
export const Welcome: Story = {
  render: () => <EmailPreview element={WelcomeEmail({ userName: 'Tomoya' })} title="Welcome" />,
};

/** メール確認 */
export const Confirm: Story = {
  render: () => (
    <EmailPreview
      element={ConfirmEmail({
        userName: 'Tomoya',
        confirmUrl: 'https://dayopt.app/auth/confirm?token=abc123',
      })}
      title="Confirm Email"
    />
  ),
};

/** パスワードリセット */
export const PasswordReset: Story = {
  render: () => (
    <EmailPreview
      element={PasswordResetEmail({
        userName: 'Tomoya',
        resetUrl: 'https://dayopt.app/auth/reset?token=abc123',
      })}
      title="Password Reset"
    />
  ),
};

/** マジックリンク */
export const MagicLink: Story = {
  render: () => (
    <EmailPreview
      element={MagicLinkEmail({
        loginUrl: 'https://dayopt.app/auth/magic-link?token=abc123',
      })}
      title="Magic Link"
    />
  ),
};

/** プランリマインダー */
export const Reminder: Story = {
  render: () => (
    <EmailPreview
      element={ReminderEmail({
        userName: 'Tomoya',
        planTitle: 'Weekly team meeting',
        startTime: '10:00 AM',
      })}
      title="Reminder"
    />
  ),
};

/** 期限超過通知 */
export const Overdue: Story = {
  render: () => (
    <EmailPreview
      element={OverdueEmail({
        userName: 'Tomoya',
        planTitle: 'Submit project report',
        endTime: '5:00 PM',
      })}
      title="Overdue"
    />
  ),
};

/** アカウント削除確認 */
export const AccountDeletion: Story = {
  render: () => (
    <EmailPreview
      element={AccountDeletionEmail({
        userName: 'Tomoya',
        deletionDate: 'February 24, 2026',
      })}
      title="Account Deletion"
    />
  ),
};
