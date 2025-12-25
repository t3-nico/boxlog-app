/**
 * Sentryテストエンドポイント
 *
 * エラー送信・パフォーマンストレース・メッセージ送信のテスト
 *
 * 使用例:
 * - GET /api/test/sentry?type=message
 * - GET /api/test/sentry?type=error
 * - GET /api/test/sentry?type=performance
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'message':
        // メッセージ送信テスト
        Sentry.captureMessage('Test message from BoxLog', {
          level: 'info',
          tags: {
            test: true,
            endpoint: 'test-sentry',
          },
          extra: {
            timestamp: new Date().toISOString(),
            userAgent: request.headers.get('user-agent'),
          },
        });
        return NextResponse.json({
          success: true,
          sent: 'message',
          message: 'Test message sent to Sentry',
        });

      case 'error':
        // エラー送信テスト
        try {
          throw new Error('Test error from BoxLog API');
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              test: true,
              endpoint: 'test-sentry',
              errorType: 'intentional',
            },
            extra: {
              timestamp: new Date().toISOString(),
              url: request.url,
            },
          });
          return NextResponse.json({
            success: true,
            sent: 'error',
            message: 'Test error sent to Sentry',
          });
        }

      case 'performance':
        // パフォーマンストレース送信テスト
        return await Sentry.startSpan(
          {
            name: 'Test Transaction',
            op: 'test',
            attributes: {
              test: true,
              endpoint: 'test-sentry',
            },
          },
          async () => {
            // 模擬処理（1秒待機）
            await new Promise((resolve) => setTimeout(resolve, 1000));

            Sentry.setMeasurement('test_duration', 1000, 'millisecond');

            return NextResponse.json({
              success: true,
              sent: 'performance',
              message: 'Test performance transaction sent to Sentry',
              duration: '1000ms',
            });
          },
        );

      case 'breadcrumb':
        // パンくずリストテスト
        Sentry.addBreadcrumb({
          message: 'Test breadcrumb',
          category: 'test',
          level: 'info',
          data: {
            timestamp: new Date().toISOString(),
            action: 'breadcrumb-test',
          },
        });

        Sentry.captureMessage('Breadcrumb test completed', 'info');

        return NextResponse.json({
          success: true,
          sent: 'breadcrumb',
          message: 'Breadcrumb added and message sent to Sentry',
        });

      default:
        // 使用方法の表示
        return NextResponse.json({
          available_types: ['message', 'error', 'performance', 'breadcrumb'],
          usage: '/api/test/sentry?type=<type>',
          examples: [
            '/api/test/sentry?type=message',
            '/api/test/sentry?type=error',
            '/api/test/sentry?type=performance',
            '/api/test/sentry?type=breadcrumb',
          ],
          note: 'Check Sentry dashboard at https://sentry.io after 5 minutes',
        });
    }
  } catch (error) {
    // 予期しないエラーもSentryに送信
    Sentry.captureException(error, {
      tags: {
        test: true,
        endpoint: 'test-sentry',
        errorType: 'unexpected',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
