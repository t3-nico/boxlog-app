import { beforeEach, describe, expect, it } from 'vitest'

import { useBoardFocusStore } from './useBoardFocusStore'

describe('useBoardFocusStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useBoardFocusStore.setState({ focusedId: null })
  })

  describe('初期状態', () => {
    it('focusedIdはnull', () => {
      expect(useBoardFocusStore.getState().focusedId).toBeNull()
    })
  })

  describe('setFocusedId', () => {
    it('フォーカスを設定できる', () => {
      useBoardFocusStore.getState().setFocusedId('card-1')

      expect(useBoardFocusStore.getState().focusedId).toBe('card-1')
    })

    it('フォーカスを変更できる', () => {
      useBoardFocusStore.getState().setFocusedId('card-1')
      useBoardFocusStore.getState().setFocusedId('card-2')

      expect(useBoardFocusStore.getState().focusedId).toBe('card-2')
    })

    it('nullを設定してフォーカスを解除できる', () => {
      useBoardFocusStore.getState().setFocusedId('card-1')
      useBoardFocusStore.getState().setFocusedId(null)

      expect(useBoardFocusStore.getState().focusedId).toBeNull()
    })
  })

  describe('clearFocus', () => {
    it('フォーカスをクリアできる', () => {
      useBoardFocusStore.getState().setFocusedId('card-1')
      useBoardFocusStore.getState().clearFocus()

      expect(useBoardFocusStore.getState().focusedId).toBeNull()
    })

    it('フォーカスがない状態でも安全にクリアできる', () => {
      useBoardFocusStore.getState().clearFocus()

      expect(useBoardFocusStore.getState().focusedId).toBeNull()
    })
  })

  describe('ワークフロー', () => {
    it('右クリック→メニュー閉じる のフローをシミュレート', () => {
      // カードを右クリック
      useBoardFocusStore.getState().setFocusedId('card-1')
      expect(useBoardFocusStore.getState().focusedId).toBe('card-1')

      // メニューを閉じる（フォーカスクリア）
      useBoardFocusStore.getState().clearFocus()
      expect(useBoardFocusStore.getState().focusedId).toBeNull()
    })

    it('複数カードの連続右クリックをシミュレート', () => {
      // 1つ目のカードを右クリック
      useBoardFocusStore.getState().setFocusedId('card-1')
      expect(useBoardFocusStore.getState().focusedId).toBe('card-1')

      // 2つ目のカードを右クリック（前のフォーカスが自動的に置き換わる）
      useBoardFocusStore.getState().setFocusedId('card-2')
      expect(useBoardFocusStore.getState().focusedId).toBe('card-2')

      // 3つ目のカードを右クリック
      useBoardFocusStore.getState().setFocusedId('card-3')
      expect(useBoardFocusStore.getState().focusedId).toBe('card-3')
    })
  })
})
