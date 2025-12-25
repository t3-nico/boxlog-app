import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

// next-intlのミドルウェアを作成
const intlMiddleware = createMiddleware(routing);

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
];

// 認証ページのパス
const authPaths = ['/login', '/signup', '/auth'];

// 公開パス（認証チェック不要）- getUser() 呼び出しをスキップしてパフォーマンス向上
const publicPaths = ['/', '/about', '/privacy', '/terms', '/contact', '/pricing'];

// 言語プレフィックスを除いたパスを取得
// as-needed設定: デフォルト言語(en)はプレフィックスなし
function getPathWithoutLocale(pathname: string): string {
  // 非デフォルトロケール(ja)のみプレフィックスあり
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue; // デフォルトはスキップ
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  // デフォルト言語またはプレフィックスなしの場合はそのまま返す
  return pathname;
}

// 現在の言語を取得
// as-needed設定: プレフィックスなし = デフォルト言語(en)
function getCurrentLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue; // デフォルトはスキップ
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

// ロケールプレフィックス付きパスを生成
// as-needed設定: デフォルト言語(en)はプレフィックスなし
function getLocalizedPath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) {
    // デフォルト言語はプレフィックスなし
    return path;
  }
  // 非デフォルト言語はプレフィックス付き
  return `/${locale}${path}`;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 静的ファイル、API、_nextファイルはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/monitoring-tunnel'
  ) {
    return NextResponse.next();
  }

  // メンテナンスページは言語処理をスキップ
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // 言語プレフィックス付きメンテナンスページへのアクセスをリダイレクト
  for (const locale of routing.locales) {
    if (pathname === `/${locale}/maintenance`) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // メンテナンスモードチェック
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  if (isMaintenanceMode) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // next-intlのミドルウェアを実行（言語検出とリダイレクト）
  const intlResponse = intlMiddleware(request);

  // リダイレクトレスポンスの場合はそのまま返す
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  const currentLocale = getCurrentLocale(pathname);
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const isProtectedPath = protectedPaths.some((path) => pathWithoutLocale.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathWithoutLocale.startsWith(path));
  const isPublicPath = publicPaths.some((path) => pathWithoutLocale === path);

  // パフォーマンス最適化: 公開ページでは getUser() をスキップ
  // getUser() は Supabase API への往復が発生するため、認証が必要なパスのみ実行
  if (isPublicPath && !isProtectedPath && !isAuthPath) {
    return intlResponse;
  }

  // Supabaseセッションを更新（ユーザー情報も同時取得 - 重複呼び出し防止で高速化）
  const { response, user } = await updateSession(request);

  try {
    // 環境変数で認証をスキップ（開発環境用）
    const skipAuth =
      process.env.SKIP_AUTH_IN_DEV === 'true' && process.env.NODE_ENV === 'development';

    if (skipAuth) {
      // next-intlのヘッダーをコピー
      intlResponse.headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // 未認証でprotectedPathにアクセスした場合
    if (!user && isProtectedPath) {
      const loginUrl = new URL(getLocalizedPath('/auth/login', currentLocale), request.url);
      loginUrl.searchParams.set('redirect', pathWithoutLocale);
      return NextResponse.redirect(loginUrl);
    }

    // 認証済みでauth系のパスにアクセスした場合
    // MFA検証ページは除外
    const isMFAVerifyPath = pathWithoutLocale === '/auth/mfa-verify';

    if (user && isAuthPath && !isMFAVerifyPath) {
      return NextResponse.redirect(
        new URL(getLocalizedPath('/calendar', currentLocale), request.url),
      );
    }

    // next-intlのヘッダーをコピー
    intlResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(
      new URL(getLocalizedPath('/auth/login', currentLocale), request.url),
    );
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
};
