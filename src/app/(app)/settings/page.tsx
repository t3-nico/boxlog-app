import { redirect } from 'next/navigation'

/**
 * 設定トップページ
 * Next.js公式: Server Componentでredirect()使用
 */
export default function SettingsIndexPage() {
  redirect('/settings/account')
}

