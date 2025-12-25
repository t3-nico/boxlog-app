'use client';

import Script from 'next/script';

import { RECAPTCHA_CONFIG } from './config';

/**
 * reCAPTCHA v3 スクリプトローダー
 * @description Auth系ページで使用。Next.jsのScriptコンポーネントで最適化ロード
 */
export function RecaptchaScript() {
  const siteKey = RECAPTCHA_CONFIG.SITE_KEY_V3;

  // サイトキーが設定されていない場合は何も表示しない
  if (!siteKey) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="lazyOnload"
    />
  );
}
