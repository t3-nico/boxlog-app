/**
 * reCAPTCHA Provider
 * @description reCAPTCHA v3をアプリ全体で利用可能にするProvider
 */

'use client'

import { ReactNode } from 'react'

import { ReCaptchaProvider } from 'next-recaptcha-v3'

import { RECAPTCHA_CONFIG } from './config'

interface RecaptchaProviderWrapperProps {
  children: ReactNode
}

export function RecaptchaProviderWrapper({ children }: RecaptchaProviderWrapperProps) {
  // reCAPTCHA v3が設定されていない場合はProviderなしで子要素を返す
  if (!RECAPTCHA_CONFIG.SITE_KEY_V3) {
    console.warn('[reCAPTCHA] v3 site key not configured')
    return <>{children}</>
  }

  return (
    <ReCaptchaProvider reCaptchaKey={RECAPTCHA_CONFIG.SITE_KEY_V3} useEnterprise={false} useRecaptchaNet={false}>
      {children}
    </ReCaptchaProvider>
  )
}
