import { redirect } from 'next/navigation'

/**
 * 設定ページ（インデックス）
 *
 * /settings にアクセスした場合、デフォルトで general にリダイレクト
 */
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/settings/general`)
}
