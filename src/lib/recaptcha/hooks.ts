/**
 * reCAPTCHA Reactフック
 * @description クライアントサイドでreCAPTCHAを使用するためのフック
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { RECAPTCHA_CONFIG } from './config'

/**
 * reCAPTCHA v3トークン生成フック
 * @description reCAPTCHA v3が設定されていない場合は無効化されたステートを返す
 */
export function useRecaptchaV3(action: string) {
  const [isReady, setIsReady] = useState(false)
  const [executeRecaptcha, setExecuteRecaptcha] = useState<((action: string) => Promise<string>) | null>(null)

  const isConfigured = Boolean(RECAPTCHA_CONFIG.SITE_KEY_V3)

  useEffect(() => {
    // reCAPTCHAが設定されていない場合は何もしない
    if (!isConfigured) {
      console.warn('[reCAPTCHA] v3 not configured, skipping initialization')
      return
    }

    // grecaptcha.enterprise または grecaptcha が利用可能になるまで待機
    const checkRecaptcha = () => {
      const grecaptcha = window.grecaptcha
      if (grecaptcha && typeof grecaptcha.execute === 'function') {
        setExecuteRecaptcha(() => async (actionName: string) => {
          return new Promise<string>((resolve, reject) => {
            grecaptcha.ready(() => {
              grecaptcha.execute(RECAPTCHA_CONFIG.SITE_KEY_V3, { action: actionName }).then(resolve).catch(reject)
            })
          })
        })
        setIsReady(true)
      }
    }

    // 既にロード済みならすぐにチェック
    checkRecaptcha()

    // ロードを待つためのインターバル
    const interval = setInterval(checkRecaptcha, 100)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!isReady) {
        console.warn('[reCAPTCHA] v3 initialization timeout')
      }
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isConfigured, isReady])

  const generateToken = useCallback(async (): Promise<string | null> => {
    if (!isConfigured) {
      console.warn('[reCAPTCHA] v3 not configured, skipping token generation')
      return null
    }

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
  }, [executeRecaptcha, action, isConfigured])

  return {
    generateToken,
    isReady: isConfigured && isReady,
  }
}

/**
 * reCAPTCHA v2 Invisibleトークン生成フック
 */
export function useRecaptchaV2() {
  const [isReady, setIsReady] = useState(false)
  const [widgetId, setWidgetId] = useState<number | null>(null)

  const isConfigured = Boolean(RECAPTCHA_CONFIG.SITE_KEY_V2)

  useEffect(() => {
    // reCAPTCHA v2が設定されていない場合は何もしない
    if (!isConfigured) {
      console.warn('[reCAPTCHA] v2 not configured, skipping script load')
      return
    }

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
      // スクリプトがまだドキュメントに存在するかチェック
      if (script.parentNode) {
        document.head.removeChild(script)
      }
    }
  }, [isConfigured])

  const renderWidget = useCallback(
    (containerId: string, callback: (token: string) => void) => {
      if (!isConfigured) {
        console.warn('[reCAPTCHA] v2 not configured')
        return
      }

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
    [isReady, isConfigured]
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
    isReady: isConfigured && isReady,
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
      execute: (siteKeyOrWidgetId: string | number, options?: { action: string }) => Promise<string>
      reset: (widgetId: number) => void
      ready: (callback: () => void) => void
    }
  }
}
