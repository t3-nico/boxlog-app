/**
 * Theme Enforcement テスト用 - 良い例
 * Tailwind CSS直接指定の正しい例
 */

import { cn } from '@/lib/utils'

export const GoodExample = () => {
  return (
    <div className={cn('bg-blue-500 text-white p-6 rounded-md')}>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Tailwind CSS直接指定の例</h1>
      <p className="text-sm text-white/80">このコンポーネントはTailwind CSSを正しく使用しています</p>
      <button className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded-md mt-4">正しいボタン</button>
    </div>
  )
}
