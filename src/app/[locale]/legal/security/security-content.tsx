'use client'

import { AlertTriangle, ExternalLink, FileText, Lock, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

import { useTranslations } from 'next-intl'

export function SecurityContent() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Shield className="text-primary h-10 w-10" />
          <h1 className="text-3xl font-bold">{t('legal.security.header.title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('legal.security.header.description')}</p>
      </div>

      {/* セキュリティポリシー */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-semibold">{t('legal.security.policy.title')}</h2>
        </div>

        <div className="bg-surface-container mb-6 rounded-xl p-6">
          <h3 className="mb-4 text-lg font-semibold">{t('legal.security.policy.supportedVersions.title')}</h3>
          <table className="border-border w-full border">
            <thead className="bg-surface-container">
              <tr>
                <th className="border-border border p-3 text-left">
                  {t('legal.security.policy.supportedVersions.version')}
                </th>
                <th className="border-border border p-3 text-left">
                  {t('legal.security.policy.supportedVersions.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-border border p-3">{t('legal.security.policy.supportedVersions.v1')}</td>
                <td className="border-border border p-3">{t('legal.security.policy.supportedVersions.v1Status')}</td>
              </tr>
              <tr>
                <td className="border-border border p-3">{t('legal.security.policy.supportedVersions.v0')}</td>
                <td className="border-border border p-3">{t('legal.security.policy.supportedVersions.v0Status')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-semibold">{t('legal.security.policy.measures.title')}</h3>
          <ul className="space-y-2">
            <li>{t('legal.security.policy.measures.https')}</li>
            <li>{t('legal.security.policy.measures.mfa')}</li>
            <li>{t('legal.security.policy.measures.rateLimit')}</li>
            <li>{t('legal.security.policy.measures.sqlInjection')}</li>
            <li>{t('legal.security.policy.measures.xss')}</li>
            <li>{t('legal.security.policy.measures.csrf')}</li>
            <li>{t('legal.security.policy.measures.dependencies')}</li>
            <li>{t('legal.security.policy.measures.monitoring')}</li>
          </ul>
        </div>
      </section>

      {/* 脆弱性報告 */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-semibold">{t('legal.security.vulnerability.title')}</h2>
        </div>

        <div className="bg-destructive/12 mb-6 rounded-xl p-6">
          <p className="text-destructive-foreground mb-4 font-semibold">
            {t('legal.security.vulnerability.warning.title')}
          </p>
          <p className="text-muted-foreground text-sm">{t('legal.security.vulnerability.warning.description')}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-semibold">{t('legal.security.vulnerability.contacts.title')}</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <strong>{t('legal.security.vulnerability.contacts.email')}</strong>:{' '}
              <a href="mailto:security@boxlog.app" className="text-primary hover:underline">
                {t('legal.security.vulnerability.contacts.emailAddress')}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <strong>{t('legal.security.vulnerability.contacts.github')}</strong>:{' '}
              <a
                href="https://github.com/t3-nico/boxlog-app/security/advisories/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('legal.security.vulnerability.contacts.githubLink')}
              </a>
            </li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold">{t('legal.security.vulnerability.includeInfo.title')}</h3>
          <ul className="space-y-2">
            <li>{t('legal.security.vulnerability.includeInfo.type')}</li>
            <li>{t('legal.security.vulnerability.includeInfo.affectedVersions')}</li>
            <li>{t('legal.security.vulnerability.includeInfo.steps')}</li>
            <li>{t('legal.security.vulnerability.includeInfo.poc')}</li>
            <li>{t('legal.security.vulnerability.includeInfo.impact')}</li>
            <li>{t('legal.security.vulnerability.includeInfo.fix')}</li>
          </ul>

          <h3 className="mt-6 text-lg font-semibold">{t('legal.security.vulnerability.timeline.title')}</h3>
          <table className="border-border w-full border">
            <thead className="bg-surface-container">
              <tr>
                <th className="border-border border p-3 text-left">
                  {t('legal.security.vulnerability.timeline.severity')}
                </th>
                <th className="border-border border p-3 text-left">
                  {t('legal.security.vulnerability.timeline.initialResponse')}
                </th>
                <th className="border-border border p-3 text-left">
                  {t('legal.security.vulnerability.timeline.fixRelease')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.critical')}</td>
                <td className="border-border border p-3">
                  {t('legal.security.vulnerability.timeline.criticalResponse')}
                </td>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.criticalFix')}</td>
              </tr>
              <tr>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.high')}</td>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.highResponse')}</td>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.highFix')}</td>
              </tr>
              <tr>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.medium')}</td>
                <td className="border-border border p-3">
                  {t('legal.security.vulnerability.timeline.mediumResponse')}
                </td>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.mediumFix')}</td>
              </tr>
              <tr>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.low')}</td>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.lowResponse')}</td>
                <td className="border-border border p-3">{t('legal.security.vulnerability.timeline.lowFix')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 責任ある開示 */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">{t('legal.security.disclosure.title')}</h2>

        <div className="bg-surface-container rounded-xl p-6">
          <h3 className="mb-4 text-lg font-semibold">{t('legal.security.disclosure.safeHarbor.title')}</h3>
          <p className="text-foreground mb-4 leading-relaxed">
            {t('legal.security.disclosure.safeHarbor.description')}
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">
                {t('legal.security.disclosure.safeHarbor.allowed.title')}
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>{t('legal.security.disclosure.safeHarbor.allowed.ownAccount')}</li>
                <li>{t('legal.security.disclosure.safeHarbor.allowed.research')}</li>
                <li>{t('legal.security.disclosure.safeHarbor.allowed.poc')}</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400">
                {t('legal.security.disclosure.safeHarbor.prohibited.title')}
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>{t('legal.security.disclosure.safeHarbor.prohibited.dos')}</li>
                <li>{t('legal.security.disclosure.safeHarbor.prohibited.dataAccess')}</li>
                <li>{t('legal.security.disclosure.safeHarbor.prohibited.disclosure')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 関連ドキュメント */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-semibold">{t('legal.security.relatedDocs.title')}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="https://github.com/t3-nico/boxlog-app/blob/main/docs/legal/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-primary block rounded-xl border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">{t('legal.security.relatedDocs.securityPolicy.title')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('legal.security.relatedDocs.securityPolicy.description')}
            </p>
          </Link>

          <Link
            href="https://github.com/t3-nico/boxlog-app/blob/main/docs/legal/VULNERABILITY_DISCLOSURE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-primary block rounded-xl border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">{t('legal.security.relatedDocs.vulnerabilityDisclosure.title')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('legal.security.relatedDocs.vulnerabilityDisclosure.description')}
            </p>
          </Link>

          <Link
            href="https://github.com/t3-nico/boxlog-app/blob/main/docs/legal/INCIDENT_RESPONSE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:border-primary block rounded-xl border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">{t('legal.security.relatedDocs.incidentResponse.title')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('legal.security.relatedDocs.incidentResponse.description')}
            </p>
          </Link>

          <Link
            href="/legal/privacy"
            className="border-border hover:border-primary block rounded-xl border p-4 transition-colors"
          >
            <h3 className="mb-2 font-semibold">{t('legal.security.relatedDocs.privacyPolicy.title')}</h3>
            <p className="text-muted-foreground text-sm">{t('legal.security.relatedDocs.privacyPolicy.description')}</p>
          </Link>
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="bg-surface-container rounded-xl p-6">
        <h2 className="mb-4 text-xl font-semibold">{t('legal.security.contact.title')}</h2>
        <div className="space-y-2">
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <strong>{t('legal.security.contact.securityTeam')}</strong>:{' '}
            <a href="mailto:security@boxlog.app" className="text-primary hover:underline">
              {t('legal.security.contact.securityEmail')}
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <strong>{t('legal.security.contact.general')}</strong>:{' '}
            <a href="mailto:support@boxlog.app" className="text-primary hover:underline">
              {t('legal.security.contact.generalEmail')}
            </a>
          </p>
        </div>

        <p className="text-muted-foreground mt-4 text-sm">{t('legal.security.contact.thankYou')}</p>
      </section>

      {/* 最終更新日 */}
      <div className="text-muted-foreground mt-8 text-center text-sm">
        <p>{t('legal.security.lastUpdated')}</p>
      </div>
    </div>
  )
}
