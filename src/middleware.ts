import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

// next-intlのミドルウェアを作成
const intlMiddleware = createMiddleware(routing)

// 認証が必要なパス
const protectedPaths = [
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

// 認証ページのパス
const authPaths = ['/login', '/signup', '/auth']

// 言語プレフィックスを除いたパスを取得
function getPathWithoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
    if (pathname === `/${locale}`) {
      return '/'
    }
  }
  return pathname
}

// 現在の言語を取得
function getCurrentLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }
  return routing.defaultLocale
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 静的ファイル、API、_nextファイルはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/monitoring-tunnel'
  ) {
    return NextResponse.next()
  }

  // メンテナンスページは言語処理をスキップ
  if (pathname === '/maintenance') {
    return NextResponse.next()
  }

  // 言語プレフィックス付きメンテナンスページへのアクセスをリダイレクト
  for (const locale of routing.locales) {
    if (pathname === `/${locale}/maintenance`) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // メンテナンスモードチェック
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  if (isMaintenanceMode) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  // next-intlのミドルウェアを実行（言語検出とリダイレクト）
  const intlResponse = intlMiddleware(request)

  // リダイレクトレスポンスの場合はそのまま返す
  if (intlResponse.status !== 200) {
    return intlResponse
  }

  // Supabaseセッションを更新
  const { response, supabase } = await updateSession(request)

  try {
    // Supabase認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 環境変数で認証をスキップ（開発環境用）
    const skipAuth = process.env.SKIP_AUTH_IN_DEV === 'true' && process.env.NODE_ENV === 'development'

    if (skipAuth) {
      // next-intlのヘッダーをコピー
      intlResponse.headers.forEach((value, key) => {
        response.headers.set(key, value)
      })
      return response
    }

    const currentLocale = getCurrentLocale(pathname)
    const pathWithoutLocale = getPathWithoutLocale(pathname)

    const isProtectedPath = protectedPaths.some((path) => pathWithoutLocale.startsWith(path))
    const isAuthPath = authPaths.some((path) => pathWithoutLocale.startsWith(path))

    // 未認証でprotectedPathにアクセスした場合
    if (!user && isProtectedPath) {
      const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathWithoutLocale)
      return NextResponse.redirect(loginUrl)
    }

    // 認証済みでauth系のパスにアクセスした場合
    // MFA検証ページは除外
    const isMFAVerifyPath = pathWithoutLocale === '/auth/mfa-verify'

    if (user && isAuthPath && !isMFAVerifyPath) {
      return NextResponse.redirect(new URL(`/${currentLocale}/calendar`, request.url))
    }

    // next-intlのヘッダーをコピー
    intlResponse.headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error('Middleware error:', error)

    const currentLocale = getCurrentLocale(pathname)
    return NextResponse.redirect(new URL(`/${currentLocale}/auth/login`, request.url))
  }
}

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
