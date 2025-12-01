import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Inboxフォーカス状態
 */
interface InboxFocusState {
  /** 現在フォーカス中のアイテムID */
  focusedId: string | null
  /** フォーカスをセット */
  setFocusedId: (id: string | null) => void
  /** 次の行にフォーカス移動 */
  focusNext: (ids: string[]) => void
  /** 前の行にフォーカス移動 */
  focusPrevious: (ids: string[]) => void
  /** フォーカスをクリア */
  clearFocus: () => void
}

/**
 * Inboxフォーカスストア
 *
 * キーボードショートカットによる行フォーカスを管理
 * - j/k キーでの上下移動
 * - Enter でのInspector開く
 * - x でのチェックボックストグル
 *
 * @example
 * ```tsx
 * const { focusedId, setFocusedId, focusNext, focusPrevious } = useInboxFocusStore()
 *
 * // フォーカスを設定
 * setFocusedId(itemId)
 *
 * // 次の行にフォーカス
 * focusNext(itemIds)
 *
 * // 前の行にフォーカス
 * focusPrevious(itemIds)
 * ```
 */
export const useInboxFocusStore = create<InboxFocusState>()(
  devtools(
    (set, get) => ({
      focusedId: null,

      setFocusedId: (id) => set({ focusedId: id }),

      focusNext: (ids) => {
        const { focusedId } = get()
        if (ids.length === 0) return

        if (!focusedId) {
          // フォーカスがない場合は最初の行にフォーカス
          set({ focusedId: ids[0] ?? null })
          return
        }

        const currentIndex = ids.findIndex((id) => id === focusedId)
        if (currentIndex === -1 || currentIndex === ids.length - 1) {
          // 見つからない、または最後の行の場合は何もしない
          return
        }

        // 次の行にフォーカス
        set({ focusedId: ids[currentIndex + 1] ?? null })
      },

      focusPrevious: (ids) => {
        const { focusedId } = get()
        if (ids.length === 0) return

        if (!focusedId) {
          // フォーカスがない場合は最初の行にフォーカス
          set({ focusedId: ids[0] ?? null })
          return
        }

        const currentIndex = ids.findIndex((id) => id === focusedId)
        if (currentIndex === -1 || currentIndex === 0) {
          // 見つからない、または最初の行の場合は何もしない
          return
        }

        // 前の行にフォーカス
        set({ focusedId: ids[currentIndex - 1] ?? null })
      },

      clearFocus: () => set({ focusedId: null }),
    }),
    { name: 'inbox-focus-store' }
  )
)
