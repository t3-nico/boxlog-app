import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale は通常、ミドルウェアから提供される
  let locale = await requestLocale

  // 無効またはサポートされていない言語の場合、デフォルトにフォールバック
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
