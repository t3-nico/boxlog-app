/**
 * Email tRPC Router
 *
 * メール送信のtRPCエンドポイント
 * Resend + React Emailを使用
 *
 * エンドポイント:
 * - email.sendWelcome: ウェルカムメール送信
 * - email.sendReminder: プランリマインダーメール送信
 * - email.sendOverdue: 期限超過通知メール送信
 * - email.sendAccountDeletion: アカウント削除確認メール送信
 * - email.sendTest: テストメール送信（開発用）
 */

import { TRPCError } from '@trpc/server';
import { Resend } from 'resend';
import { z } from 'zod';

import { AccountDeletionEmail } from '@/emails/AccountDeletionEmail';
import { OverdueEmail } from '@/emails/OverdueEmail';
import { ReminderEmail } from '@/emails/ReminderEmail';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { logger } from '@/lib/logger';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

// Resendクライアント初期化
const resend = new Resend(process.env.RESEND_API_KEY);

// 送信元メールアドレス
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dayopt.app';

/**
 * Resend APIでメールを送信する共通ヘルパー
 */
async function sendEmail({
  to,
  subject,
  react,
  context,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
  context: string;
}) {
  const { data, error } = await resend.emails.send({
    from: `Dayopt <${FROM_EMAIL}>`,
    to,
    subject,
    react,
  });

  if (error) {
    logger.error(`${context} failed`, { error, to });
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to send email: ${error.message}`,
    });
  }

  logger.info(`${context} sent`, { emailId: data?.id, to });
  return { success: true as const, emailId: data?.id };
}

/**
 * Email Router
 */
export const emailRouter = createTRPCRouter({
  /**
   * ウェルカムメール送信
   */
  sendWelcome: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        userName: z.string().min(1, 'User name is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info('Sending welcome email', { email: input.email, userId: ctx.userId });

      return sendEmail({
        to: input.email,
        subject: 'Welcome to Dayopt!',
        react: WelcomeEmail({ userName: input.userName, appUrl: APP_URL }),
        context: 'Welcome email',
      });
    }),

  /**
   * プランリマインダーメール送信
   *
   * notification_preferences.enable_email_notifications が有効な
   * ユーザーに対して送信。check-reminders Edge Function から呼び出し可能。
   */
  sendReminder: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        userName: z.string().min(1),
        planTitle: z.string().min(1),
        startTime: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info('Sending reminder email', { planTitle: input.planTitle, userId: ctx.userId });

      return sendEmail({
        to: input.email,
        subject: `Reminder: ${input.planTitle}`,
        react: ReminderEmail({
          userName: input.userName,
          planTitle: input.planTitle,
          startTime: input.startTime,
          appUrl: APP_URL,
        }),
        context: 'Reminder email',
      });
    }),

  /**
   * 期限超過通知メール送信
   */
  sendOverdue: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        userName: z.string().min(1),
        planTitle: z.string().min(1),
        endTime: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info('Sending overdue email', { planTitle: input.planTitle, userId: ctx.userId });

      return sendEmail({
        to: input.email,
        subject: `Overdue: ${input.planTitle}`,
        react: OverdueEmail({
          userName: input.userName,
          planTitle: input.planTitle,
          endTime: input.endTime,
          appUrl: APP_URL,
        }),
        context: 'Overdue email',
      });
    }),

  /**
   * アカウント削除確認メール送信 (GDPR対応)
   */
  sendAccountDeletion: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        userName: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info('Sending account deletion email', { userId: ctx.userId });

      return sendEmail({
        to: input.email,
        subject: 'Your Dayopt account has been deleted',
        react: AccountDeletionEmail({
          userName: input.userName,
          deletionDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          appUrl: APP_URL,
        }),
        context: 'Account deletion email',
      });
    }),

  /**
   * テストメール送信（開発用）
   */
  sendTest: publicProcedure
    .input(
      z.object({
        to: z.string().email('Invalid email address'),
        subject: z.string().min(1, 'Subject is required').default('Test Email from Dayopt'),
      }),
    )
    .mutation(async ({ input }) => {
      // 本番環境では無効化
      if (process.env.NODE_ENV === 'production') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Test endpoint is not available in production',
        });
      }

      logger.info('Sending test email', { to: input.to });

      return sendEmail({
        to: input.to,
        subject: input.subject,
        react: WelcomeEmail({
          userName: 'Test User',
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        }),
        context: 'Test email',
      });
    }),
});
