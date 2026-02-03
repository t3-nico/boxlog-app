/**
 * Toast通知ユーティリティ
 *
 * 共通パターンを提供し、各featureは内容のみカスタマイズ
 *
 * @example
 * ```tsx
 * import { showToast } from '@/lib/toast';
 *
 * // 基本的な使い方
 * showToast.error('エラーが発生しました');
 * showToast.success('保存しました');
 * showToast.warning('警告メッセージ');
 * showToast.info('情報メッセージ');
 *
 * // Undo付きトースト
 * showToast.withUndo({
 *   title: '削除しました',
 *   description: '「タスク名」を削除しました',
 *   onUndo: async () => { await restoreItem(); },
 * });
 *
 * // Promise統合
 * showToast.promise(asyncFn(), {
 *   loading: '処理中...',
 *   success: '完了しました',
 *   error: 'エラーが発生しました',
 * });
 * ```
 */

import { toast, type ExternalToast } from 'sonner';

// トーストのタイプ
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// 共通オプション
export interface ToastOptions {
  description?: string;
  duration?: number;
  id?: string | number;
}

// Undo付きトーストオプション
export interface UndoToastOptions extends ToastOptions {
  title: string;
  onUndo: () => void | Promise<void>;
  /** Undo成功時のメッセージ（デフォルト: '元に戻しました'） */
  undoSuccessMessage?: string;
}

// Promise統合オプション
export interface PromiseToastOptions<T> {
  loading?: string;
  success?: string | ((data: T) => string);
  error?: string | ((error: Error) => string);
}

// デフォルトduration（ミリ秒）
const DEFAULT_DURATION = 6000;
const UNDO_DURATION = 10000; // Undo可能なトーストは長め

/**
 * オプションをExternalToast形式に変換（undefined値を除外）
 */
function buildToastOptions(
  options?: ToastOptions,
  defaultDuration?: number,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (options?.description !== undefined) result.description = options.description;
  if (options?.id !== undefined) result.id = options.id;
  if (defaultDuration !== undefined) result.duration = options?.duration ?? defaultDuration;
  return result;
}

/**
 * エラートースト
 * - 失敗時のみ表示（信頼ベースUX）
 * - 赤い左ボーダー
 */
function error(title: string, options?: ToastOptions): string | number {
  return toast.error(title, buildToastOptions(options, DEFAULT_DURATION));
}

/**
 * 成功トースト
 * - 基本的には使用しない（信頼ベースUX）
 * - 必要な場合のみ使用（例: 重要な操作完了時）
 */
function success(title: string, options?: ToastOptions): string | number {
  return toast.success(title, buildToastOptions(options, DEFAULT_DURATION));
}

/**
 * 警告トースト
 * - 注意が必要な状態を通知
 */
function warning(title: string, options?: ToastOptions): string | number {
  return toast.warning(title, buildToastOptions(options, DEFAULT_DURATION));
}

/**
 * 情報トースト
 * - 補足情報の通知
 */
function info(title: string, options?: ToastOptions): string | number {
  return toast.info(title, buildToastOptions(options, DEFAULT_DURATION));
}

/**
 * ローディングトースト
 * - 非同期処理中の表示
 */
function loading(title: string, options?: ToastOptions): string | number {
  return toast.loading(title, buildToastOptions(options));
}

/**
 * Undo付きトースト
 * - 削除などの取り消し可能な操作に使用
 * - 10秒間表示
 * - 右下にUndoボタン配置
 */
function withUndo(options: UndoToastOptions): string | number {
  const { title, description, onUndo, undoSuccessMessage = '元に戻しました', duration } = options;

  return toast(title, {
    description,
    duration: duration ?? UNDO_DURATION,
    action: {
      label: '元に戻す',
      onClick: async () => {
        try {
          await onUndo();
          toast.success(undoSuccessMessage);
        } catch {
          toast.error('元に戻せませんでした');
        }
      },
    },
  });
}

/**
 * Promise統合トースト
 * - loading → success/error を自動切り替え
 */
async function promiseToast<T>(
  promiseFn: Promise<T>,
  messages: PromiseToastOptions<T>,
): Promise<T> {
  const id = toast.loading(messages.loading ?? '処理中...');

  try {
    const result = await promiseFn;
    toast.dismiss(id);
    const successMessage =
      typeof messages.success === 'function' ? messages.success(result) : messages.success;
    if (successMessage) {
      toast.success(successMessage);
    }
    return result;
  } catch (err) {
    toast.dismiss(id);
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const errorMessage =
      typeof messages.error === 'function'
        ? messages.error(errorObj)
        : (messages.error ?? 'エラーが発生しました');
    toast.error(errorMessage);
    throw err;
  }
}

/**
 * トーストを閉じる
 */
function dismiss(id?: string | number): void {
  toast.dismiss(id);
}

/**
 * カスタムトースト（JSX対応）
 */
function custom(content: () => React.ReactElement, options?: ExternalToast): string | number {
  return toast.custom(content, options);
}

// 公開API
export const showToast = {
  error,
  success,
  warning,
  info,
  loading,
  withUndo,
  promise: promiseToast,
  dismiss,
  custom,
} as const;
