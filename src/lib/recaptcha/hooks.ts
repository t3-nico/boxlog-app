/**
 * reCAPTCHA Reactフック
 * @description クライアントサイドでreCAPTCHAを使用するためのフック
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { useReCaptcha } from 'next-recaptcha-v3'

import { RECAPTCHA_CONFIG } from './config'

/**
 * reCAPTCHA v3トークン生成フック
 */
export function useRecaptchaV3(action: string) {
  const { executeRecaptcha } = useReCaptcha()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(Boolean(executeRecaptcha))
  }, [executeRecaptcha])

  const generateToken = useCallback(async (): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.warn('[reCAPTCHA] executeRecaptcha not ready')
      return null
    }

    try {
      const token = await executeRecaptcha(action)
      return token
    } catch (error) {
      console.error('[reCAPTCHA] Token generation error:', error)
      return null
    }
  }, [executeRecaptcha, action])

  return {
    generateToken,
    isReady,
  }
}

/**
 * reCAPTCHA v2 Invisibleトークン生成フック
 */
export function useRecaptchaV2() {
  const [isReady, setIsReady] = useState(false)
  const [widgetId, setWidgetId] = useState<number | null>(null)

  useEffect(() => {
    // reCAPTCHA v2スクリプトをロード
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsReady(true)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const renderWidget = useCallback(
    (containerId: string, callback: (token: string) => void) => {
      if (!isReady || !window.grecaptcha) {
        console.warn('[reCAPTCHA] v2 not ready')
        return
      }

      const id = window.grecaptcha.render(containerId, {
        sitekey: RECAPTCHA_CONFIG.SITE_KEY_V2,
        size: 'invisible',
        callback,
      })

      setWidgetId(id)
    },
    [isReady]
  )

  const execute = useCallback(() => {
    if (!isReady || !window.grecaptcha || widgetId === null) {
      console.warn('[reCAPTCHA] v2 not ready or widget not rendered')
      return
    }

    window.grecaptcha.execute(widgetId)
  }, [isReady, widgetId])

  const reset = useCallback(() => {
    if (!isReady || !window.grecaptcha || widgetId === null) {
      return
    }

    window.grecaptcha.reset(widgetId)
  }, [isReady, widgetId])

  return {
    isReady,
    renderWidget,
    execute,
    reset,
  }
}

// TypeScript型定義
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          size: 'invisible' | 'normal'
          callback: (token: string) => void
        }
      ) => number
      execute: (widgetId: number) => void
      reset: (widgetId: number) => void
      ready: (callback: () => void) => void
    }
  }
}
