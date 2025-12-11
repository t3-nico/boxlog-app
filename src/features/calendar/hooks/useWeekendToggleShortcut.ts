import { useEffect } from 'react'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'

/**
 * 週末表示切り替えのキーボードショートカット（Cmd/Ctrl + W）を管理するフック
 */
export function useWeekendToggleShortcut() {
  const { showWeekends, updateSettings } = useCalendarSettingsStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd (Mac) または Ctrl (Windows/Linux) + W
      const isToggleShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'w'

      if (!isToggleShortcut) return

      // デフォルトのブラウザ動作（ウィンドウを閉じる）を防ぐ
      event.preventDefault()
      event.stopPropagation()

      // 入力フィールドにフォーカスがある場合は無視
      const { activeElement } = document
      const isInputField =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true' ||
          activeElement.getAttribute('role') === 'textbox')

      if (isInputField) return

      // モーダルやダイアログが開いている場合は無視
      const hasOpenModal = document.querySelector('[role="dialog"]') !== null
      if (hasOpenModal) return

      // 週末表示を切り替え
      updateSettings({ showWeekends: !showWeekends })

      // 成功フィードバック（短時間のトースト風通知）
      showToggleFeedback(!showWeekends)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showWeekends, updateSettings])

  return {
    showWeekends,
    toggleWeekends: () => updateSettings({ showWeekends: !showWeekends }),
  }
}

/**
 * 切り替え時のフィードバック表示
 */
function showToggleFeedback(newState: boolean) {
  // 既存の通知があれば削除
  const existingNotification = document.getElementById('weekend-toggle-feedback')
  if (existingNotification) {
    existingNotification.remove()
  }

  // 通知要素を作成
  const notification = document.createElement('div')
  notification.id = 'weekend-toggle-feedback'
  notification.className = `
    fixed top-4 right-4 z-[300]
    bg-white dark:bg-gray-800
    border border-border
    rounded-xl shadow-lg
    px-4 py-3
    flex items-center gap-3
    transform transition-all duration-300 ease-out
    translate-x-full opacity-0
  `
    .replace(/\s+/g, ' ')
    .trim()

  // 内容を設定
  notification.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full ${newState ? 'bg-green-500' : 'bg-orange-500'}"></div>
      <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
        週末表示: ${newState ? 'ON' : 'OFF'}
      </span>
    </div>
    <div class="text-xs text-gray-500 dark:text-gray-400">
      Cmd/Ctrl + W
    </div>
  `

  document.body.appendChild(notification)

  // アニメーションで表示
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0')
    notification.classList.add('translate-x-0', 'opacity-100')
  }, 10)

  // 2秒後にフェードアウト
  setTimeout(() => {
    notification.classList.add('translate-x-full', 'opacity-0')

    // アニメーション完了後に削除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 2000)
}

import { getTranslation } from '@/features/calendar/lib/toast/get-translation'

const CALENDAR_ACCESSIBILITY_KEYS = {
  TOGGLE_WEEKEND: 'calendar.accessibility.toggleWeekend',
} as const

/**
 * ショートカットキーのヘルプ情報
 */
export const WEEKEND_TOGGLE_SHORTCUT_HELP = {
  key: 'Cmd/Ctrl + W',
  description: getTranslation(CALENDAR_ACCESSIBILITY_KEYS.TOGGLE_WEEKEND),
  mac: '⌘W',
  windows: 'Ctrl+W',
} as const
