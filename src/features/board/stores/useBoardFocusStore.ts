import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Boardフォーカス状態
 */
interface BoardFocusState {
  /** 現在フォーカス中のカードID */
  focusedId: string | null
  /** フォーカスをセット */
  setFocusedId: (id: string | null) => void
  /** フォーカスをクリア */
  clearFocus: () => void
}

/**
 * Boardフォーカスストア
 *
 * 右クリック時のカードフォーカスを管理
 * - 右クリックでフォーカスリング表示
 *
 * @example
 * ```tsx
 * const { focusedId, setFocusedId } = useBoardFocusStore()
 *
 * // フォーカスを設定
 * setFocusedId(cardId)
 * ```
 */
export const useBoardFocusStore = create<BoardFocusState>()(
  devtools(
    (set) => ({
      focusedId: null,

      setFocusedId: (id) => set({ focusedId: id }),

      clearFocus: () => set({ focusedId: null }),
    }),
    { name: 'board-focus-store' }
  )
)
