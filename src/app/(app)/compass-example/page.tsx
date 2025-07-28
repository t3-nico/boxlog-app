'use client'

import { Button } from '@compass/components'
import { useToggle } from '@compass/hooks'
import { formatDate } from '@compass/lib'
import { colors } from '@compass/constants'
import { theme } from '@compass/config'

export default function CompassExamplePage() {
  const [isOpen, toggle] = useToggle(false)

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Compass共通ライブラリの使用例</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. 共通コンポーネント</h2>
        <div className="flex gap-4">
          <Button>Compassボタン</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. 共通Hooks</h2>
        <div>
          <button 
            onClick={toggle}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Toggle: {isOpen ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. ユーティリティ関数</h2>
        <p>現在の日時: {formatDate(new Date())}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. 共通定数</h2>
        <div className="flex gap-2">
          {Object.entries(colors).map(([name, value]) => (
            <div 
              key={name}
              className="w-16 h-16 rounded flex items-center justify-center text-xs"
              style={{ backgroundColor: value }}
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. 設定情報</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(theme, null, 2)}
        </pre>
      </section>
    </div>
  )
}