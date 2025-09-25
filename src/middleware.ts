import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { defaultLocale, LOCALE_COOKIE, locales } from '@/lib/i18n'

// 言語を必要としないパス（静的リソースなど）
const excludedPaths = ['/api', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/locales', '/images', '/icons']

function getLocale(request: NextRequest): string {
  // 1. URLパスから言語を取得
  const pathname = request.nextUrl.pathname
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1]
    return locale
  }

  // 2. Cookieから言語を取得
  const localeCookie = request.cookies.get(LOCALE_COOKIE)
  if (localeCookie && locales.includes(localeCookie.value as 'en' | 'ja')) {
    return localeCookie.value
  }

  // 3. Accept-Languageヘッダーから言語を取得
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const browserLocales = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].split('-')[0])
      .filter((lang) => locales.includes(lang as 'en' | 'ja'))

    if (browserLocales.length > 0) {
      return browserLocales[0]
    }
  }

  // 4. デフォルト言語を返す
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 除外パスをチェック
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // すでに言語プレフィックスがある場合はそのまま通す
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // 言語を検出してリダイレクト
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)

  // Cookie設定
  const response = NextResponse.redirect(newUrl)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 31536000, // 1年
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|locales|images|icons).*)',
  ],
}
