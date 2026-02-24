/**
 * Resend Webhook エンドポイント
 *
 * Resend Dashboard → Webhooks でこのURLを登録:
 *   https://dayopt.app/api/webhooks/resend
 *
 * 監視イベント:
 * - email.bounced: バウンス検知（無効アドレス）
 * - email.complained: スパム苦情
 * - email.delivered: 配信成功（ログ用）
 *
 * @see https://resend.com/docs/dashboard/webhooks/introduction
 */

import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

interface ResendWebhookEvent {
  type:
    | 'email.sent'
    | 'email.delivered'
    | 'email.delivery_delayed'
    | 'email.bounced'
    | 'email.complained'
    | 'email.opened'
    | 'email.clicked';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: {
      message: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const event: ResendWebhookEvent = await request.json();

    switch (event.type) {
      case 'email.bounced':
        logger.error('Email bounced', {
          emailId: event.data.email_id,
          to: event.data.to,
          subject: event.data.subject,
          bounce: event.data.bounce?.message,
        });
        // TODO: バウンスしたアドレスをDBに記録し、再送信を防止
        break;

      case 'email.complained':
        logger.error('Email spam complaint', {
          emailId: event.data.email_id,
          to: event.data.to,
          subject: event.data.subject,
        });
        // TODO: 苦情アドレスのメール配信を自動停止
        break;

      case 'email.delivered':
        logger.info('Email delivered', {
          emailId: event.data.email_id,
          to: event.data.to,
        });
        break;

      case 'email.delivery_delayed':
        logger.warn('Email delivery delayed', {
          emailId: event.data.email_id,
          to: event.data.to,
        });
        break;

      default:
        // sent, opened, clicked は現時点ではログのみ
        logger.info('Resend webhook event', {
          type: event.type,
          emailId: event.data.email_id,
        });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Resend webhook error', { error });
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
