/**
 * クロノタイプ説明セクションコンポーネント
 */

import { Clock, GraduationCap, Lightbulb, Moon } from 'lucide-react'

interface ChronotypeInfoSectionProps {
  onStartDiagnosis: () => void
}

export function ChronotypeInfoSection({ onStartDiagnosis }: ChronotypeInfoSectionProps) {
  return (
    <div className="border-border bg-card mt-8 rounded-lg border p-6">
      <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        クロノタイプとは？
      </h2>

      <div className="prose prose-sm max-w-none">
        <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
          <p>
            <strong>クロノタイプ（Chronotype）</strong>
            は、個人の体内時計（概日リズム）によって決まる活動パターンのことです。
            人それぞれ異なる生物学的な時間軸を持っており、これを理解して活用することで生産性と well-being
            を向上させることができます。
          </p>

          <h3 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-100">📊 4つのクロノタイプ</h3>

          <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-border rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-950">
              <h4 className="mb-2 font-semibold text-yellow-600 dark:text-yellow-400">🦁 Lion (ライオン型・超朝型)</h4>
              <ul className="space-y-1 text-sm text-yellow-600 dark:text-yellow-400">
                <li>• 人口の約 15%</li>
                <li>• 早朝（5-7時）起床、7-11時がピーク</li>
                <li>• 夜は21時頃には疲れる</li>
                <li>• リーダーシップを発揮しやすい</li>
              </ul>
            </div>

            <div className="border-border rounded-lg border bg-blue-50 p-4 dark:bg-blue-950">
              <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">🐻 Bear (クマ型・標準型)</h4>
              <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                <li>• 人口の約 55%</li>
                <li>• 7-8時起床、9-12時と14-17時がピーク</li>
                <li>• 太陽のサイクルに同調</li>
                <li>• 最も一般的なタイプ</li>
              </ul>
            </div>

            <div className="border-border bg-muted rounded-lg border p-4">
              <h4 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">🐺 Wolf (オオカミ型・夜型)</h4>
              <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <li>• 人口の約 20%</li>
                <li>• 17-22時がピーク、深夜も活動的</li>
                <li>• 朝は調子が上がりにくい</li>
                <li>• 創造性と直感力が高い</li>
              </ul>
            </div>

            <div className="border-border rounded-lg border bg-green-50 p-4 dark:bg-green-950">
              <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">🐬 Dolphin (イルカ型・不規則型)</h4>
              <ul className="space-y-1 text-sm text-green-600 dark:text-green-400">
                <li>• 人口の約 10%</li>
                <li>• 複数の短いピーク時間</li>
                <li>• 睡眠が浅く、中途覚醒が多い</li>
                <li>• 高い知性と完璧主義傾向</li>
              </ul>
            </div>
          </div>

          <h3 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-100">
            🎯 クロノタイプを活用するメリット
          </h3>

          <ul className="ml-4 list-inside list-disc space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">生産性の向上</strong>
              ：自分のピーク時間に重要なタスクを配置
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">ストレス軽減</strong>
              ：体内時計に逆らわない働き方でストレス減少
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">創造性の発揮</strong>
              ：クリエイティブな時間帯を意識的に活用
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">健康の維持</strong>
              ：自然なリズムに合わせた生活で心身の健康をサポート
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-neutral-100">チームワークの改善</strong>
              ：メンバーのクロノタイプを理解した協働
            </li>
          </ul>

          <h3 className="mb-6 text-lg font-bold text-neutral-900 dark:text-neutral-100">📝 作業タイプの分類</h3>

          <div className="my-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            <div className="flex items-center gap-2 rounded-sm bg-green-50 p-2 dark:bg-green-950">
              <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" data-slot="icon" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">Focus</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-neutral-100 p-2 dark:bg-neutral-700">
              <Lightbulb className="h-4 w-4 text-neutral-900 dark:text-neutral-100" data-slot="icon" />
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Creative</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-blue-50 p-2 dark:bg-blue-950">
              <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" data-slot="icon" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Rest</span>
            </div>
            <div className="flex items-center gap-2 rounded bg-neutral-100 p-2 dark:bg-neutral-700">
              <Clock className="h-4 w-4 text-neutral-600 dark:text-neutral-400" data-slot="icon" />
              <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Admin</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm bg-blue-50 p-2 dark:bg-blue-900/20">
              <span className="text-sm">💤</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Sleep</span>
            </div>
          </div>

          <p className="text-sm">
            <strong>Focus</strong>：集中力を要する重要な作業
            <br />
            <strong>Creative</strong>：アイデア出し、企画、デザインなどの創造的作業
            <br />
            <strong>Rest</strong>：休憩、軽い作業、リラックス時間
            <br />
            <strong>Admin</strong>：メール処理、事務作業、ルーチンタスク
            <br />
            <strong>Sleep</strong>：睡眠時間、休息を推奨する時間帯
          </p>

          <div className="mt-6 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              💡 <strong>ヒント</strong>：クロノタイプは遺伝的要因が大きく、完全に変えることは困難です。
              重要なのは自分のタイプを受け入れ、それに合わせて作業スケジュールを最適化することです。
            </p>
          </div>

          {/* 診断ボタン */}
          <div className="border-border mt-6 border-t pt-6 text-center">
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              自分のクロノタイプが分からない方は、診断をお試しください
            </p>
            <button
              type="button"
              onClick={onStartDiagnosis}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              🔍 クロノタイプ診断を開始
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
