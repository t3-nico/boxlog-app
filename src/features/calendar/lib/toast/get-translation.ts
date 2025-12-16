/**
 * Translation getter for Non-Client Components
 *
 * Non-Client Componentsでは useI18n() フックが使えないため、
 * 直接辞書から翻訳テキストを取得する
 */

// 翻訳辞書の型
interface Dictionary {
  [key: string]: string | Dictionary
}

// 翻訳キーから値を取得するヘルパー
export function getTranslation(key: string, locale: 'ja' | 'en' = 'ja'): string {
  // キーのパスを分割（例: "calendar.event.moved" → ["calendar", "event", "moved"]）
  const keys = key.split('.')

  // ここでは日本語のみ対応（将来的にはlocaleに応じて切り替え可能）
  // 実際の辞書データは require/import で読み込む代わりに、
  // 定数として定義するか、実行時に取得する
  const translations: Record<'ja' | 'en', Dictionary> = {
    ja: {
      calendar: {
        accessibility: {
          toggleWeekend: '週末表示の切り替え',
        },
        event: {
          moved: '予定を移動しました',
          resized: '予定をリサイズしました',
          saved: '保存しました',
          created: '予定を作成しました',
          updated: '予定を更新しました',
          deleted: '予定を削除しました',
          duplicated: '予定を複製しました',
          bulkDeleted: '複数の予定を削除しました',
          bulkDeletedDesc: '件の予定を削除',
          movedTo: 'を',
          movedToSuffix: 'に移動',
        },
        toast: {
          moved: '予定を移動しました',
          resized: '時間を変更しました',
          created: '予定を作成しました',
          updated: '予定を更新しました',
          deleted: '予定を削除しました',
          saving: '保存中...',
          error: '操作に失敗しました',
          offline: 'オフラインです',
          offlineDesc: 'インターネット接続を確認してください',
          timeoutTitle: 'タイムアウトしました',
          timeoutDesc: 'しばらく待ってから再試行してください',
          authErrorTitle: '認証エラー',
          authErrorDesc: '再度ログインしてください',
          accessDeniedTitle: 'アクセス拒否',
          accessDeniedDesc: 'この操作を実行する権限がありません',
          notFoundTitle: 'データが見つかりません',
          notFoundDesc: 'データが削除されているか移動されています',
          conflictTitle: 'データが更新されています',
          conflictDesc: '他のユーザーがデータを変更しました。最新のデータを確認してください',
          serverErrorTitle: 'サーバーエラー',
          serverErrorDesc: 'サーバーで問題が発生しています。しばらく待ってから再試行してください',
          unknownErrorTitle: 'エラーが発生しました',
          unknownErrorDesc: '予期しないエラーです',
          permissionErrorTitle: '権限がありません',
          permissionErrorDesc: 'この操作を実行する権限がありません',
          validationErrorTitle: '入力エラー',
          operationInProgress: '件の操作を実行中...',
          operationFailed: '件の操作が失敗しました',
          operation: '操作',
          syncStarted: 'カレンダーを同期中...',
          syncCompleted: '同期が完了しました',
          syncFailed: '同期に失敗しました',
          syncFailedDesc: 'ネットワーク接続を確認してください',
          undo: '元に戻す',
          undoCompleted: '操作を取り消しました',
          view: '表示',
          retry: '再試行',
          processing: 'Processing...',
          success: 'Success!',
          errorOccurred: 'Error occurred',
        },
        errors: {
          unauthorized: '認証が必要です',
          forbidden: 'アクセスが拒否されました',
          notFound: 'リソースが見つかりません',
          conflict: 'データに競合が発生しました',
          serverError: 'サーバーエラーが発生しました',
          offline: 'インターネット接続がありません',
          timeout: 'リクエストがタイムアウトしました',
          unexpected: '予期しないエラーが発生しました',
        },
      },
    },
    en: {
      calendar: {
        accessibility: {
          toggleWeekend: 'Toggle weekend display',
        },
        event: {
          moved: 'Plan moved',
          resized: 'Plan resized',
          saved: 'Saved',
          created: 'Plan created',
          updated: 'Plan updated',
          deleted: 'Plan deleted',
          duplicated: 'Plan duplicated',
          bulkDeleted: 'Multiple events deleted',
          bulkDeletedDesc: ' events deleted',
          movedTo: ' moved to ',
          movedToSuffix: '',
        },
        toast: {
          moved: 'Plan moved',
          resized: 'Time changed',
          created: 'Plan created',
          updated: 'Plan updated',
          deleted: 'Plan deleted',
          saving: 'Saving...',
          error: 'Operation failed',
          offline: 'You are offline',
          offlineDesc: 'Please check your internet connection',
          timeoutTitle: 'Request timed out',
          timeoutDesc: 'Please wait a moment and try again',
          authErrorTitle: 'Authentication Error',
          authErrorDesc: 'Please log in again',
          accessDeniedTitle: 'Access Denied',
          accessDeniedDesc: 'You do not have permission to perform this action',
          notFoundTitle: 'Data Not Found',
          notFoundDesc: 'The data has been deleted or moved',
          conflictTitle: 'Data Updated',
          conflictDesc: 'Another user has modified the data. Please check the latest data',
          serverErrorTitle: 'Server Error',
          serverErrorDesc: 'A problem has occurred on the server. Please wait a moment and try again',
          unknownErrorTitle: 'An Error Occurred',
          unknownErrorDesc: 'An unexpected error occurred',
          permissionErrorTitle: 'Permission Denied',
          permissionErrorDesc: 'You do not have permission to perform this action',
          validationErrorTitle: 'Validation Error',
          operationInProgress: ' operations in progress...',
          operationFailed: ' operations failed',
          operation: 'operation',
          syncStarted: 'Syncing calendar...',
          syncCompleted: 'Sync completed',
          syncFailed: 'Sync failed',
          syncFailedDesc: 'Please check your network connection',
          undo: 'Undo',
          undoCompleted: 'Operation undone',
          view: 'View',
          retry: 'Retry',
          processing: 'Processing...',
          success: 'Success!',
          errorOccurred: 'Error occurred',
        },
        errors: {
          unauthorized: 'Authentication required',
          forbidden: 'Access denied',
          notFound: 'Resource not found',
          conflict: 'Data conflict occurred',
          serverError: 'Server error occurred',
          offline: 'No internet connection',
          timeout: 'Request timed out',
          unexpected: 'An unexpected error occurred',
        },
      },
    },
  }

  // キーパスに従って値を取得
  let result: string | Dictionary | undefined = translations[locale]
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      // キーが見つからない場合はキー自体を返す
      return key
    }
  }

  // undefined チェックを追加
  if (result === undefined) {
    return key
  }

  return typeof result === 'string' ? result : key
}
