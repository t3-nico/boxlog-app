/**
 * reCAPTCHA検証ユーティリティ
 * @description サーバーサイドでreCAPTCHAトークンを検証
 */

import { RECAPTCHA_CONFIG, isDevelopment } from './config';

/**
 * reCAPTCHA検証レスポンス
 */
export interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number | undefined; // v3のみ
  action?: string | undefined; // v3のみ
  challenge_ts?: string | undefined;
  hostname?: string | undefined;
  'error-codes'?: string[] | undefined;
}

/**
 * reCAPTCHA v3トークンを検証
 */
export async function verifyRecaptchaV3(
  token: string,
  expectedAction?: string,
): Promise<RecaptchaVerifyResponse> {
  // 開発環境ではスキップ（オプション）
  if (isDevelopment() && !RECAPTCHA_CONFIG.SECRET_KEY_V3) {
    console.warn('[reCAPTCHA] v3 secret key not configured, skipping verification in development');
    return {
      success: true,
      score: 1.0,
      action: expectedAction,
    };
  }

  try {
    const response = await fetch(RECAPTCHA_CONFIG.VERIFY_URL_V3, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_CONFIG.SECRET_KEY_V3,
        response: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API returned ${response.status}`);
    }

    const data: RecaptchaVerifyResponse = await response.json();

    // アクションの検証（指定されている場合）
    if (expectedAction && data.action !== expectedAction) {
      return {
        ...data,
        success: false,
        'error-codes': ['action-mismatch'],
      };
    }

    return data;
  } catch (error) {
    console.error('[reCAPTCHA] Verification error:', error);
    return {
      success: false,
      'error-codes': ['verification-failed'],
    };
  }
}

/**
 * reCAPTCHA v2トークンを検証
 */
export async function verifyRecaptchaV2(token: string): Promise<RecaptchaVerifyResponse> {
  // 開発環境ではスキップ（オプション）
  if (isDevelopment() && !RECAPTCHA_CONFIG.SECRET_KEY_V2) {
    console.warn('[reCAPTCHA] v2 secret key not configured, skipping verification in development');
    return {
      success: true,
    };
  }

  try {
    const response = await fetch(RECAPTCHA_CONFIG.VERIFY_URL_V2, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_CONFIG.SECRET_KEY_V2,
        response: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API returned ${response.status}`);
    }

    const data: RecaptchaVerifyResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[reCAPTCHA] Verification error:', error);
    return {
      success: false,
      'error-codes': ['verification-failed'],
    };
  }
}

/**
 * reCAPTCHA v3スコアが閾値を超えているか確認
 */
export function isScoreAboveThreshold(score: number | undefined, threshold: number): boolean {
  if (score === undefined) return false;
  return score >= threshold;
}
