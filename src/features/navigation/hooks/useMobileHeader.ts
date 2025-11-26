'use client'

import { useEffect } from 'react'

import { useMobileHeaderStore } from '../stores/useMobileHeaderStore'

interface MobileHeaderConfig {
  /** ページタイトル */
  title: string
  /** 右側のアクションボタン（React要素） */
  actions?: React.ReactNode
  /** ハンバーガーメニューを表示するか（デフォルト: true） */
  showMenuButton?: boolean
}

/**
 * モバイルヘッダー設定フック
 *
 * ページコンポーネントで使用し、モバイルヘッダーの設定を行う
 *
 * @example
 * ```tsx
 * function CalendarPage() {
 *   useMobileHeader({
 *     title: 'カレンダー',
 *     actions: (
 *       <>
 *         <Button variant="ghost" size="icon">
 *           <Search className="size-5" />
 *         </Button>
 *       </>
 *     ),
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useMobileHeader(config: MobileHeaderConfig) {
  const { setConfig, reset } = useMobileHeaderStore()

  useEffect(() => {
    setConfig(config)

    return () => {
      reset()
    }
    // config内のactionsはReact要素なので、依存配列には含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.title, config.showMenuButton, setConfig, reset])
}
