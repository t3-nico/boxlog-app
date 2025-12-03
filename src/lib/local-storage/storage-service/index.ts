/**
 * ローカルストレージサービス
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./types.ts - 型定義
 * @see ./utils.ts - ユーティリティ
 * @see ./event-repository.ts - イベントリポジトリ
 * @see ./log-repository.ts - ログリポジトリ
 * @see ./service.ts - メインサービス
 */

// 型定義
export { DataCorruptionError, StorageQuotaExceededError } from './types'
export type { LocalEvent, LocalLog, LocalTag, StoredEvent, StoredLog } from './types'

// サービス
export { LocalStorageService, localStorageService } from './service'

// デフォルトエクスポート
export { localStorageService as default } from './service'
