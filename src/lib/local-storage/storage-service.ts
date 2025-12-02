/**
 * BoxLog ローカルストレージサービス
 * イベントとログをローカルストレージで管理
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./storage-service/
 */

export {
  DataCorruptionError,
  LocalStorageService,
  localStorageService,
  StorageQuotaExceededError,
} from './storage-service/index'

export type { LocalEvent, LocalLog, LocalTag, StoredEvent, StoredLog } from './storage-service/index'

export { default } from './storage-service/index'
