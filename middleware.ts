import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // 開発時はより安全にタイムアウトを設定
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth timeout')), 3000)
    })

    const { data: { user } } = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise
    ]) as any

    // 認証が必要なパスの定義（(app)ルートグループ内のすべてのパス）
    const protectedPaths = [
      '/dashboard', 
      '/tasks', 
      '/settings', 
      '/calendar',  // 追加
      '/box', 
      '/table', 
      '/board', 
      '/stats', 
      '/review',
      '/notifications',
      '/tags',
      '/add'
    ]
    const authPaths = ['/login', '/signup', '/auth']

    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )
    const isAuthPath = authPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )

    // 未認証でprotectedPathにアクセスした場合
    if (!user && isProtectedPath) {
      console.log('Redirecting to login:', request.nextUrl.pathname)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 認証済みでauth系のパスにアクセスした場合
    if (user && isAuthPath) {
      console.log('Redirecting to dashboard:', request.nextUrl.pathname)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // エラーが発生した場合は、静的ページ以外はログインにリダイレクト
    const isStaticPath = request.nextUrl.pathname.startsWith('/_next') || 
                         request.nextUrl.pathname.startsWith('/api') ||
                         request.nextUrl.pathname === '/login' ||
                         request.nextUrl.pathname === '/signup'
    
    if (!isStaticPath) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return response
  }
}

export const config = {
  matcher: [
    // Next.jsの静的ファイルと画像ファイルを除外
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}