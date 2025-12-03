/**
 * 📤 BoxLog Logger Outputs
 *
 * ログ出力先の実装・管理
 *
 * リファクタリング: 複数ファイルに分割
 * @see ./console.ts - コンソール出力
 * @see ./file.ts - ファイル出力
 * @see ./webhook.ts - Webhook出力
 * @see ./supabase.ts - Supabase出力
 * @see ./multi.ts - 複数出力先
 * @see ./factories.ts - ファクトリー関数
 */

export { ConsoleOutput } from './console'
export { FileOutput, RotatingFileOutput } from './file'
export { MultiOutput } from './multi'
export { SupabaseOutput } from './supabase'
export { WebhookOutput } from './webhook'

export {
  createConsoleOutput,
  createFileOutput,
  createRotatingFileOutput,
  createSupabaseOutput,
  createWebhookOutput,
} from './factories'

// デフォルトエクスポート
import { ConsoleOutput } from './console'
import {
  createConsoleOutput,
  createFileOutput,
  createRotatingFileOutput,
  createSupabaseOutput,
  createWebhookOutput,
} from './factories'
import { FileOutput, RotatingFileOutput } from './file'
import { MultiOutput } from './multi'
import { SupabaseOutput } from './supabase'
import { WebhookOutput } from './webhook'

const loggerOutputs = {
  ConsoleOutput,
  FileOutput,
  RotatingFileOutput,
  WebhookOutput,
  SupabaseOutput,
  MultiOutput,
  createConsoleOutput,
  createFileOutput,
  createRotatingFileOutput,
  createWebhookOutput,
  createSupabaseOutput,
}

export default loggerOutputs
