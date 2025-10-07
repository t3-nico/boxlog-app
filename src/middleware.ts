import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, LOCALE_COOKIE, locales } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

// 言語検出とリダイレクト処理
function getLocaleFromRequest(request: NextRequest): Locale {
  // 1. URLパスから言語を取得
  const pathname = request.nextUrl.pathname
  const pathLocale = locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathLocale) {
    return pathLocale
  }

  // 2. Cookieから言語を取得
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value as Locale
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  // 3. Accept-Languageヘッダーから言語を取得
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => {
        const parts = lang.split(';')[0]?.split('-')
        return parts?.[0]?.trim() || ''
      })
      .find((lang) => locales.includes(lang as Locale)) as Locale

    if (preferredLocale) {
      return preferredLocale
    }
  }

  return defaultLocale
}

function shouldRedirectToLocale(pathname: string): boolean {
  // 既に言語プレフィックスがある場合はリダイレクト不要
  if (locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)) {
    return false
  }

  // 静的ファイル、API、_nextファイルは除外
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return false
  }

  return true
}

async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locale = getLocaleFromRequest(request)

  // 言語リダイレクトの処理
  if (shouldRedirectToLocale(pathname)) {
    const redirectUrl = new URL(`/${locale}${pathname}`, request.url)
    const response = NextResponse.redirect(redirectUrl)

    // 言語選択をCookieに保存
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 31536000, // 1年
      sameSite: 'lax',
    })

    return response
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // TODO: Supabase認証統合
    // 現在は認証チェックを無効化（開発中）
    // 実装時は以下を使用:
    // const { data: { session } } = await createServerClient().auth.getSession()
    // const user = session?.user ?? null
    const user = null

    // 環境変数で認証をスキップ（開発環境用）
    const skipAuth = process.env.SKIP_AUTH_IN_DEV === 'true' && process.env.NODE_ENV === 'development'

    if (skipAuth) {
      return response
    }

    // 現在の言語を取得
    const currentLocale = locales.find((locale) => pathname.startsWith(`/${locale}`)) || defaultLocale

    // 言語プレフィックスを除いたパスを取得
    const localePrefix = `/${currentLocale}`
    const pathWithoutLocale = pathname.startsWith(localePrefix) ? pathname.slice(localePrefix.length) || '/' : pathname

    // 認証が必要なパスの定義（言語プレフィックス除外）
    const protectedPaths = [
      '/dashboard',
      '/tasks',
      '/settings',
      '/calendar',
      '/box',
      '/table',
      '/board',
      '/stats',
      '/review',
      '/notifications',
      '/tags',
      '/add',
    ]
    const authPaths = ['/login', '/signup', '/auth']

    const isProtectedPath = protectedPaths.some((path) => pathWithoutLocale.startsWith(path))
    const isAuthPath = authPaths.some((path) => pathWithoutLocale.startsWith(path))

    // 未認証でprotectedPathにアクセスした場合
    if (!user && isProtectedPath) {
      console.log('[Middleware] Redirecting to login:', request.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/${currentLocale}/auth/login`, request.url))
    }

    // 認証済みでauth系のパスにアクセスした場合
    if (user && isAuthPath) {
      console.log('[Middleware] Redirecting to dashboard:', request.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)

    // エラーが発生した場合は、静的ページ以外はログインにリダイレクト
    const isStaticPath =
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup'

    if (!isStaticPath) {
      return NextResponse.redirect(new URL(`/${defaultLocale}/auth/login`, request.url))
    }

    return response
  }
}

export default middleware

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|robots.txt|sitemap.xml).*)',
  ],
}
