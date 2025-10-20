/**
 * reCAPTCHA統合ライブラリ
 * @description Google reCAPTCHA v2/v3の統合
 */

// 設定
export { RECAPTCHA_CONFIG, isDevelopment, isRecaptchaV2Enabled, isRecaptchaV3Enabled } from './config'

// サーバーサイド検証
export { isScoreAboveThreshold, verifyRecaptchaV2, verifyRecaptchaV3 } from './verify'
export type { RecaptchaVerifyResponse } from './verify'

// クライアントサイドフック
export { useRecaptchaV2, useRecaptchaV3 } from './hooks'
