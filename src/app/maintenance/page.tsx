/**
 * メンテナンスページ
 *
 * システムメンテナンス中に表示されるページ
 * locale プレフィックスなしでアクセス可能（/maintenance）
 */

import { Wrench } from 'lucide-react'

export const metadata = {
  title: 'Under Maintenance | BoxLog',
  description: 'System is currently under maintenance',
}

export default function MaintenancePage() {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-8 dark:bg-neutral-900">
          <div className="w-full max-w-md text-center">
            {/* アイコン */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Wrench className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>

            {/* タイトル（日本語） */}
            <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              メンテナンス中
            </h1>

            {/* タイトル（英語） */}
            <p className="mb-6 text-lg text-neutral-600 dark:text-neutral-400">Under Maintenance</p>

            {/* 説明（日本語） */}
            <p className="mb-2 text-neutral-700 dark:text-neutral-300">
              現在、システムメンテナンスを実施しています。
            </p>

            {/* 説明（英語） */}
            <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-500">
              We&apos;re currently performing system maintenance.
            </p>

            {/* お詫びメッセージ */}
            <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                ご不便をおかけして申し訳ございません。
                <br />
                <span className="text-xs text-neutral-500">
                  We apologize for the inconvenience.
                </span>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
