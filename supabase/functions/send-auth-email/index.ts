/**
 * Supabase Edge Function: Custom Auth Emails with Resend
 *
 * Supabase Auth Hook経由で呼び出され、カスタムメールを送信。
 * Deno環境のため React Email は使えず、インラインHTMLで構築。
 * スタイルは src/emails/styles.ts のトークン値と統一。
 *
 * @see https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend
 */

import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'auth@send.dayopt.app';
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://dayopt.app';

interface WebhookPayload {
  type: 'signup' | 'recovery' | 'magic_link';
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
  };
}

/**
 * カラートークン（src/emails/styles.ts と統一）
 * globals.css セマンティックトークンの hex 変換値
 */
const colors = {
  background: '#fafafa',
  foreground: '#1c1c1c',
  card: '#ffffff',
  primary: '#2b4acb',
  primaryForeground: '#ffffff',
  mutedForeground: '#464655',
  border: '#b3b3ba',
};

/**
 * 共通のメールレイアウトを生成
 */
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background-color:${colors.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Ubuntu,sans-serif;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${colors.background};">
    <tr><td align="center" style="padding:20px 0 48px;">
      <table width="580" cellpadding="0" cellspacing="0" style="background-color:${colors.card};max-width:580px;">
        <tr><td style="padding:0 48px;">
          ${content}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="font-size:28px;line-height:1.3;font-weight:700;color:${colors.foreground};margin:24px 0;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="font-size:16px;line-height:1.5;color:${colors.foreground};margin:0 0 16px;">${text}</p>`;
}

function buttonLink(text: string, href: string): string {
  return `<a href="${href}" style="display:block;background-color:${colors.primary};border-radius:8px;color:${colors.primaryForeground};font-size:16px;font-weight:600;text-decoration:none;text-align:center;padding:12px 24px;margin:24px 0;">${text}</a>`;
}

function smallText(text: string): string {
  return `<p style="font-size:14px;line-height:1.5;color:${colors.mutedForeground};">${text}</p>`;
}

function footerText(text: string): string {
  return `<p style="font-size:14px;line-height:1.5;color:${colors.mutedForeground};margin-top:32px;border-top:1px solid ${colors.border};padding-top:24px;">${text}</p>`;
}

function fallbackUrl(url: string): string {
  return smallText(
    `If the button doesn't work, copy and paste this link into your browser:<br/><a href="${url}" style="color:${colors.primary};text-decoration:underline;word-break:break-all;">${url}</a>`,
  );
}

/**
 * テンプレート生成
 */
function buildSignupEmail(userName: string, confirmUrl: string): { subject: string; html: string } {
  return {
    subject: 'Confirm your Dayopt email',
    html: emailLayout(`
      ${heading('Confirm your email')}
      ${paragraph(`Hi ${userName},`)}
      ${paragraph('Thanks for signing up for Dayopt. Please confirm your email address by clicking the button below.')}
      ${buttonLink('Confirm Email Address', confirmUrl)}
      ${fallbackUrl(confirmUrl)}
      ${footerText(`If you didn't create an account on <a href="${APP_URL}" style="color:${colors.primary};text-decoration:underline;">Dayopt</a>, you can safely ignore this email.<br/><br/>The Dayopt Team`)}
    `),
  };
}

function buildRecoveryEmail(userName: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset your Dayopt password',
    html: emailLayout(`
      ${heading('Reset your password')}
      ${paragraph(`Hi ${userName},`)}
      ${paragraph('We received a request to reset your Dayopt password. Click the button below to choose a new password.')}
      ${buttonLink('Reset Password', resetUrl)}
      ${fallbackUrl(resetUrl)}
      ${smallText('This link will expire in 24 hours.')}
      ${footerText(`If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.<br/><br/>The Dayopt Team`)}
    `),
  };
}

function buildMagicLinkEmail(loginUrl: string): { subject: string; html: string } {
  return {
    subject: 'Log in to Dayopt',
    html: emailLayout(`
      ${heading('Log in to Dayopt')}
      ${paragraph('Click the button below to log in to your Dayopt account. No password needed.')}
      ${buttonLink('Log In to Dayopt', loginUrl)}
      ${fallbackUrl(loginUrl)}
      ${smallText('This link will expire in 1 hour.')}
      ${footerText(`If you didn't request this login link, you can safely ignore this email.<br/><br/>The Dayopt Team`)}
    `),
  };
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const userName = payload.user.user_metadata.full_name || 'there';
  const redirectUrl = payload.email_data.redirect_to || APP_URL;

  let email: { subject: string; html: string };

  switch (payload.type) {
    case 'signup':
      email = buildSignupEmail(userName, redirectUrl);
      break;
    case 'recovery':
      email = buildRecoveryEmail(userName, redirectUrl);
      break;
    case 'magic_link':
      email = buildMagicLinkEmail(redirectUrl);
      break;
  }

  const { data, error } = await resend.emails.send({
    from: `Dayopt <${FROM_EMAIL}>`,
    to: payload.user.email,
    subject: email.subject,
    html: email.html,
  });

  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
