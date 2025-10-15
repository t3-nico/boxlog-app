import Link from 'next/link'
import type { ReactNode } from 'react'

interface LegalLayoutProps {
  children: ReactNode
}

/**
 * 法的文書ページ共通レイアウト
 * - Privacy Policy、Terms of Service、OSS Creditsで共有
 * - ナビゲーションリンク、最終更新日時を表示
 */
export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      {/* ヘッダーナビゲーション */}
      <header className="border-b-border bg-card border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4 md:px-8">
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/calendar" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              ← BoxLogに戻る
            </Link>
            <div className="border-l-border ml-auto flex flex-wrap gap-4 border-l pl-4">
              <Link
                href="/legal/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/legal/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/legal/oss-credits"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                OSSライセンス
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>{children}</main>

      {/* フッター */}
      <footer className="border-t-border bg-muted/20 mt-16 border-t">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-muted-foreground text-sm">
              <p className="mb-1">© 2025 BoxLog. All rights reserved.</p>
              <p>お問い合わせ: support@boxlog.app</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/legal/privacy"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="/legal/terms"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                利用規約
              </Link>
              <Link
                href="/legal/oss-credits"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                OSSライセンス
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
