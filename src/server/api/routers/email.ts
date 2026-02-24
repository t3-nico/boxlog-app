/**
 * Email tRPC Router
 *
 * メール送信のtRPCエンドポイント
 * Resend + React Emailを使用
 *
 * エンドポイント:
 * - email.sendWelcome: ウェルカムメール送信
 * - email.sendTest: テストメール送信（開発用）
 */

import { TRPCError } from '@trpc/server';
import { Resend } from 'resend';
import { z } from 'zod';

import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { logger } from '@/lib/logger';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

// Resendクライアント初期化
const resend = new Resend(process.env.RESEND_API_KEY);

// 送信元メールアドレス
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

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
      try {
        logger.info('Sending welcome email', { email: input.email, userId: ctx.userId });

        const { data, error } = await resend.emails.send({
          from: `Dayopt <${FROM_EMAIL}>`,
          to: input.email,
          subject: 'Welcome to Dayopt!',
          react: WelcomeEmail({
            userName: input.userName,
            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://dayopt.app',
          }),
        });

        if (error) {
          logger.error('Welcome email send failed', { error, email: input.email });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to send welcome email: ${error.message}`,
          });
        }

        logger.info('Welcome email sent successfully', { emailId: data?.id, email: input.email });

        return {
          success: true,
          emailId: data?.id,
          message: 'Welcome email sent successfully',
        };
      } catch (err) {
        logger.error('Unexpected error sending welcome email', { err, email: input.email });

        if (err instanceof TRPCError) {
          throw err;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while sending the email',
        });
      }
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

      try {
        logger.info('Sending test email', { to: input.to });

        const { data, error } = await resend.emails.send({
          from: `Dayopt Test <${FROM_EMAIL}>`,
          to: input.to,
          subject: input.subject,
          react: WelcomeEmail({
            userName: 'Test User',
            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          }),
        });

        if (error) {
          logger.error('Test email send failed', { error, to: input.to });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to send test email: ${error.message}`,
          });
        }

        logger.info('Test email sent successfully', { emailId: data?.id, to: input.to });

        return {
          success: true,
          emailId: data?.id,
          message: 'Test email sent successfully',
        };
      } catch (err) {
        logger.error('Unexpected error sending test email', { err, to: input.to });

        if (err instanceof TRPCError) {
          throw err;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while sending the test email',
        });
      }
    }),
});
