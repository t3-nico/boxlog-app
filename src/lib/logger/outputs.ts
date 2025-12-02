/**
 * 📤 BoxLog Logger Outputs
 *
 * ログ出力先の実装・管理
 * - Console・File・External Service出力
 * - ローテーション・バッファリング・エラーハンドリング
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./outputs/
 */

export {
  ConsoleOutput,
  createConsoleOutput,
  createFileOutput,
  createRotatingFileOutput,
  createSupabaseOutput,
  createWebhookOutput,
  FileOutput,
  MultiOutput,
  RotatingFileOutput,
  SupabaseOutput,
  WebhookOutput,
} from './outputs/index'

export { default } from './outputs/index'
