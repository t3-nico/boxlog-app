import { AlertTriangle, ExternalLink, FileText, Lock, Mail, Shield } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Security - BoxLog',
    description: 'BoxLog Security Policy, Vulnerability Disclosure Guidelines, and Security Measures',
  }
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Shield className="text-primary h-10 w-10" />
          <h1 className="text-3xl font-bold">セキュリティ</h1>
        </div>
        <p className="text-muted-foreground">
          BoxLogは、ユーザーの皆様の情報を保護するために、最高水準のセキュリティ対策を実施しています。
        </p>
      </div>

      {/* セキュリティポリシー */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-semibold">セキュリティポリシー</h2>
        </div>

        <div className="bg-muted/50 mb-6 rounded-lg p-6">
          <h3 className="mb-4 text-lg font-semibold">サポート対象バージョン</h3>
          <table className="border-border w-full border">
            <thead className="bg-muted">
              <tr>
                <th className="border-border border p-3 text-left">バージョン</th>
                <th className="border-border border p-3 text-left">サポート状況</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-border border p-3">1.x.x</td>
                <td className="border-border border p-3">✅ セキュリティアップデート提供中</td>
              </tr>
              <tr>
                <td className="border-border border p-3">&lt; 1.0</td>
                <td className="border-border border p-3">❌ サポート終了</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-semibold">実装しているセキュリティ対策</h3>
          <ul className="space-y-2">
            <li>
              <strong>HTTPS強制</strong>: すべての通信をTLS 1.3で暗号化
            </li>
            <li>
              <strong>多要素認証 (MFA)</strong>: TOTP（Time-based One-Time Password）対応
            </li>
            <li>
              <strong>レート制限</strong>: ブルートフォース攻撃防止
            </li>
            <li>
              <strong>SQL インジェクション対策</strong>: Prisma ORM + パラメータ化クエリ
            </li>
            <li>
              <strong>XSS対策</strong>: React自動エスケープ + Content Security Policy
            </li>
            <li>
              <strong>CSRF対策</strong>: SameSite Cookie + トークン検証
            </li>
            <li>
              <strong>依存関係管理</strong>: Dependabot による週次チェック
            </li>
            <li>
              <strong>エラー監視</strong>: Sentry によるリアルタイム監視
            </li>
          </ul>
        </div>
      </section>

      {/* 脆弱性報告 */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-semibold">脆弱性の報告</h2>
        </div>

        <div className="bg-destructive/10 mb-6 rounded-lg p-6">
          <p className="text-destructive-foreground mb-4 font-semibold">
            ⚠️ セキュリティ脆弱性は公開のGitHub Issuesで報告しないでください
          </p>
          <p className="text-muted-foreground text-sm">
            脆弱性を公開することで、悪意ある第三者に悪用される可能性があります。
            セキュリティチームに直接ご連絡ください。
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-semibold">報告窓口</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <strong>Email</strong>:{' '}
              <a href="mailto:security@boxlog.app" className="text-primary hover:underline">
                security@boxlog.app
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <strong>GitHub Security Advisory</strong>:{' '}
              <a
                href="https://github.com/yourusername/boxlog-app/security/advisories/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Create Advisory
              </a>
            </li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold">報告に含めるべき情報</h3>
          <ul className="space-y-2">
            <li>脆弱性の種類（XSS, SQLインジェクション, 認証バイパス等）</li>
            <li>影響を受けるバージョン</li>
            <li>再現手順（詳細なステップ）</li>
            <li>概念実証コード（Proof of Concept, 可能であれば）</li>
            <li>潜在的な影響（データ漏洩、サービス停止等）</li>
            <li>推奨される修正方法（任意）</li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold">対応タイムライン</h3>
          <table className="border-border w-full border">
            <thead className="bg-muted">
              <tr>
                <th className="border-border border p-3 text-left">深刻度</th>
                <th className="border-border border p-3 text-left">初動確認</th>
                <th className="border-border border p-3 text-left">修正リリース</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-border border p-3">Critical</td>
                <td className="border-border border p-3">24時間以内</td>
                <td className="border-border border p-3">48時間以内</td>
              </tr>
              <tr>
                <td className="border-border border p-3">High</td>
                <td className="border-border border p-3">48時間以内</td>
                <td className="border-border border p-3">1週間以内</td>
              </tr>
              <tr>
                <td className="border-border border p-3">Medium</td>
                <td className="border-border border p-3">1週間以内</td>
                <td className="border-border border p-3">2週間以内</td>
              </tr>
              <tr>
                <td className="border-border border p-3">Low</td>
                <td className="border-border border p-3">2週間以内</td>
                <td className="border-border border p-3">次回リリース</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 責任ある開示 */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">責任ある開示（Responsible Disclosure）</h2>

        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="mb-4 text-lg font-semibold">セーフハーバー（Safe Harbor）</h3>
          <p className="text-foreground mb-4 leading-relaxed">
            ガイドラインに従って行われたセキュリティ研究活動に対して、法的措置を取ることはありません。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">✅ 許可される行為</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• 自身のアカウントでのテスト</li>
                <li>• 脆弱性の調査と報告</li>
                <li>• 概念実証コードの作成</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400">❌ 禁止される行為</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• DoS/DDoS攻撃</li>
                <li>• 他者のデータへのアクセス</li>
                <li>• 公開前の第三者への開示</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 関連ドキュメント */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-semibold">関連ドキュメント</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="https://github.com/yourusername/boxlog-app/blob/main/docs/legal/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-primary block rounded-lg border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">Security Policy</h3>
            <p className="text-muted-foreground text-sm">セキュリティポリシー詳細（GitHub）</p>
          </Link>

          <Link
            href="https://github.com/yourusername/boxlog-app/blob/main/docs/legal/VULNERABILITY_DISCLOSURE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-primary block rounded-lg border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">Vulnerability Disclosure</h3>
            <p className="text-muted-foreground text-sm">脆弱性報告ガイドライン（GitHub）</p>
          </Link>

          <Link
            href="https://github.com/yourusername/boxlog-app/blob/main/docs/legal/INCIDENT_RESPONSE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-primary block rounded-lg border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">Incident Response Plan</h3>
            <p className="text-muted-foreground text-sm">インシデント対応計画（GitHub）</p>
          </Link>

          <Link
            href="/legal/privacy"
            className="border-border hover:border-primary block rounded-lg border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">Privacy Policy</h3>
            <p className="text-muted-foreground text-sm">プライバシーポリシー</p>
          </Link>
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="bg-muted/50 rounded-lg p-6">
        <h2 className="mb-4 text-xl font-semibold">お問い合わせ</h2>
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <strong>セキュリティチーム</strong>:{' '}
            <a href="mailto:security@boxlog.app" className="text-primary hover:underline">
              security@boxlog.app
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <strong>一般的なお問い合わせ</strong>:{' '}
            <a href="mailto:support@boxlog.app" className="text-primary hover:underline">
              support@boxlog.app
            </a>
          </p>
        </div>

        <p className="text-muted-foreground mt-4 text-sm">
          セキュリティ向上にご協力いただき、ありがとうございます。
          皆様の報告により、すべてのユーザーの安全性が向上します。
        </p>
      </section>

      {/* 最終更新日 */}
      <div className="text-muted-foreground mt-8 text-center text-sm">
        <p>最終更新日: 2025-10-15</p>
      </div>
    </div>
  )
}
