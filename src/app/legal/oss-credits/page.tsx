import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'
import type { Metadata } from 'next'
import Link from 'next/link'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * OSSクレジット情報の型定義
 */
interface CreditInfo {
  name: string
  version: string
  license: string
  repository?: string
  publisher?: string
  copyright?: string
}

/**
 * メタデータ生成（SEO対策）
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Open Source Licenses - BoxLog',
    description:
      'License information for open source software used in BoxLog. List of third-party dependencies and their licenses.',
  }
}

/**
 * OSSクレジットページ（Server Component）
 */
export default async function OSSCreditsPage() {
  // OSSクレジット情報を読み込み
  const creditsPath = join(process.cwd(), 'public/oss-credits.json')
  let credits: CreditInfo[] = []
  let loadError = false

  try {
    const creditsData = readFileSync(creditsPath, 'utf-8')
    credits = JSON.parse(creditsData) as CreditInfo[]
  } catch (error) {
    console.error('Failed to load OSS credits:', error)
    loadError = true
  }

  // i18n翻訳取得（デフォルトロケールja）
  const locale: Locale = 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  // ライセンス統計を計算
  const licenseStats: Record<string, number> = {}
  credits.forEach((credit) => {
    licenseStats[credit.license] = (licenseStats[credit.license] || 0) + 1
  })

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('ossCredits.title')}</h1>
        <p className="text-muted-foreground">{t('ossCredits.description')}</p>
      </div>

      {/* イントロダクション */}
      <div className="bg-muted mb-8 rounded-lg p-6">
        <p className="text-foreground mb-4">{t('ossCredits.intro')}</p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{t('ossCredits.totalPackages')}:</span>
          <span className="text-foreground text-xl font-semibold">{credits.length}</span>
        </div>
      </div>

      {/* エラー表示 */}
      {loadError && (
        <div className="bg-destructive/10 text-destructive border-destructive/20 mb-8 rounded-lg border p-6">
          <p className="font-semibold">{t('ossCredits.loadingError')}</p>
        </div>
      )}

      {/* ライセンス統計 */}
      {!loadError && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">License Distribution</h2>
          <div className="bg-card border-border grid grid-cols-2 gap-4 rounded-lg border p-6 md:grid-cols-4">
            {Object.entries(licenseStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([license, count]) => (
                <div key={license} className="text-center">
                  <div className="text-muted-foreground text-sm">{license}</div>
                  <div className="text-foreground text-2xl font-bold">{count}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* パッケージリスト */}
      {!loadError && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Package List ({credits.length})</h2>
          <div className="space-y-4">
            {credits.map((credit) => (
              <div
                key={`${credit.name}-${credit.version}`}
                className="bg-card border-border hover:border-primary/50 rounded-lg border p-6 transition-colors"
              >
                <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-foreground text-lg font-semibold">
                    {credit.name}
                    <span className="text-muted-foreground ml-2 text-sm font-normal">v{credit.version}</span>
                  </h3>
                  <span className="bg-primary/10 text-primary w-fit rounded px-3 py-1 text-sm font-medium">
                    {credit.license}
                  </span>
                </div>

                <div className="text-muted-foreground space-y-1 text-sm">
                  {credit.publisher && (
                    <div>
                      <span className="font-medium">{t('ossCredits.publisher')}:</span> {credit.publisher}
                    </div>
                  )}
                  {credit.repository && (
                    <div>
                      <span className="font-medium">{t('ossCredits.repository')}:</span>{' '}
                      <Link
                        href={credit.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {credit.repository}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* フッター - 詳細情報へのリンク */}
      <div className="bg-muted mt-12 rounded-lg p-6 text-center">
        <p className="text-muted-foreground mb-4 text-sm">For complete license texts and NOTICE files, please see:</p>
        <div className="flex flex-col gap-2 md:flex-row md:justify-center md:gap-4">
          <Link href="/THIRD_PARTY_NOTICES.txt" target="_blank" className="text-primary hover:underline">
            THIRD_PARTY_NOTICES.txt
          </Link>
          <Link
            href="https://github.com/your-org/boxlog-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub Repository
          </Link>
        </div>
      </div>
    </div>
  )
}
