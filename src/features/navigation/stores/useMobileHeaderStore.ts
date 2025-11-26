import { create } from 'zustand'

interface MobileHeaderConfig {
  /** ページタイトル */
  title: string
  /** 右側のアクションボタン（React要素） */
  actions?: React.ReactNode
  /** ハンバーガーメニューを表示するか */
  showMenuButton?: boolean
}

interface MobileHeaderStore {
  /** 現在のヘッダー設定 */
  config: MobileHeaderConfig
  /** ヘッダー設定を更新 */
  setConfig: (config: MobileHeaderConfig) => void
  /** 設定をリセット */
  reset: () => void
}

const defaultConfig: MobileHeaderConfig = {
  title: '',
  actions: undefined,
  showMenuButton: true,
}

/**
 * モバイルヘッダー設定用ストア
 *
 * 各ページがマウント時にヘッダー設定を登録し、
 * MobileLayoutがそれを読み取ってMobileHeaderを表示する
 */
export const useMobileHeaderStore = create<MobileHeaderStore>((set) => ({
  config: defaultConfig,
  setConfig: (config) => set({ config }),
  reset: () => set({ config: defaultConfig }),
}))
