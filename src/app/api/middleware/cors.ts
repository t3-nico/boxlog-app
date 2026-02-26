/**
 * CORS ミドルウェア
 */

import { NextRequest, NextResponse } from 'next/server';

import { createAppError, ERROR_CODES } from '@/config/error-patterns';

/**
 * CORS ヘッダーを設定
 */
export function setCorsHeaders(req: NextRequest, allowedOrigins?: string[]): NextResponse {
  const response = new NextResponse();
  const origin = req.headers.get('origin');

  if (allowedOrigins && origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (!allowedOrigins) {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * タイムアウト Promise を作成
 */
export function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(createAppError(`Request timeout after ${timeout}ms`, ERROR_CODES.API_TIMEOUT));
    }, timeout);
  });
}
