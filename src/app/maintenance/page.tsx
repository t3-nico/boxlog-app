/**
 * メンテナンスページ
 *
 * システムメンテナンス中に表示されるページ
 * locale プレフィックスなしでアクセス可能（/maintenance）
 *
 * 注意: layout.tsx で Providers を読み込まず、
 * 不要な接続（Supabase Realtime等）を防ぐ
 */

import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="bg-card border-border w-full max-w-md rounded-lg border p-8 shadow-lg">
        {/* アイコン */}
        <div className="mb-6 flex justify-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <Wrench className="text-muted-foreground h-8 w-8" />
          </div>
        </div>

        {/* タイトル */}
        <div className="mb-6 text-center">
          <h1 className="text-foreground mb-2 text-2xl font-bold">メンテナンス中</h1>
          <p className="text-muted-foreground text-sm">Under Maintenance</p>
        </div>

        {/* 説明 */}
        <div className="bg-muted mb-6 rounded p-4">
          <p className="text-foreground mb-2 text-sm">現在、システムメンテナンスを実施しています。</p>
          <p className="text-muted-foreground text-xs">We&apos;re currently performing system maintenance.</p>
        </div>

        {/* お詫びメッセージ */}
        <p className="text-muted-foreground text-center text-xs">
          ご不便をおかけして申し訳ございません。
          <br />
          <span className="text-muted-foreground/70">We apologize for the inconvenience.</span>
        </p>
      </div>
    </div>
  )
}
