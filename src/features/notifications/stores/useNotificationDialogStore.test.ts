import { beforeEach, describe, expect, it } from 'vitest'

import { useNotificationDialogStore } from './useNotificationDialogStore'

describe('useNotificationDialogStore', () => {
  beforeEach(() => {
    // テスト前にストアをリセット
    useNotificationDialogStore.setState({ isOpen: false })
  })

  describe('初期状態', () => {
    it('isOpenはfalse', () => {
      expect(useNotificationDialogStore.getState().isOpen).toBe(false)
    })
  })

  describe('open', () => {
    it('ダイアログを開ける', () => {
      useNotificationDialogStore.getState().open()

      expect(useNotificationDialogStore.getState().isOpen).toBe(true)
    })

    it('既に開いている状態でもエラーにならない', () => {
      useNotificationDialogStore.getState().open()
      useNotificationDialogStore.getState().open()

      expect(useNotificationDialogStore.getState().isOpen).toBe(true)
    })
  })

  describe('close', () => {
    it('ダイアログを閉じれる', () => {
      useNotificationDialogStore.getState().open()
      useNotificationDialogStore.getState().close()

      expect(useNotificationDialogStore.getState().isOpen).toBe(false)
    })

    it('既に閉じている状態でもエラーにならない', () => {
      useNotificationDialogStore.getState().close()

      expect(useNotificationDialogStore.getState().isOpen).toBe(false)
    })
  })

  describe('toggle', () => {
    it('閉じている状態からトグルで開く', () => {
      useNotificationDialogStore.getState().toggle()

      expect(useNotificationDialogStore.getState().isOpen).toBe(true)
    })

    it('開いている状態からトグルで閉じる', () => {
      useNotificationDialogStore.getState().open()
      useNotificationDialogStore.getState().toggle()

      expect(useNotificationDialogStore.getState().isOpen).toBe(false)
    })

    it('連続トグルで状態が交互に変わる', () => {
      useNotificationDialogStore.getState().toggle() // false -> true
      expect(useNotificationDialogStore.getState().isOpen).toBe(true)

      useNotificationDialogStore.getState().toggle() // true -> false
      expect(useNotificationDialogStore.getState().isOpen).toBe(false)

      useNotificationDialogStore.getState().toggle() // false -> true
      expect(useNotificationDialogStore.getState().isOpen).toBe(true)
    })
  })
})
