/**
 * Supabase Edge Function: Custom Auth Emails with Resend
 *
 * Supabase Auth Hook経由で呼び出され、カスタムメールを送信
 *
 * @see https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend
 */

import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  let subject = '';
  let html = '';

  switch (payload.type) {
    case 'signup':
      subject = 'Welcome to Dayopt - Confirm your email';
      html = `
        <h1>Welcome to Dayopt!</h1>
        <p>Hi ${payload.user.user_metadata.full_name || 'there'},</p>
        <p>Please confirm your email address by clicking the link below:</p>
        <a href="${payload.email_data.redirect_to}">Confirm Email</a>
      `;
      break;

    case 'recovery':
      subject = 'Reset your Dayopt password';
      html = `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${payload.email_data.redirect_to}">Reset Password</a>
      `;
      break;

    case 'magic_link':
      subject = 'Your Dayopt magic link';
      html = `
        <h1>Magic Link Login</h1>
        <p>Click the link below to log in:</p>
        <a href="${payload.email_data.redirect_to}">Log In</a>
      `;
      break;
  }

  const { data, error } = await resend.emails.send({
    from: 'Dayopt <auth@send.dayopt.app>',
    to: payload.user.email,
    subject,
    html,
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
