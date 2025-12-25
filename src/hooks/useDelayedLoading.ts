import { useEffect, useState } from 'react';

/**
 * 遅延ローディング表示フック
 *
 * 短時間（300ms以下）のローディングでは表示をスキップし、
 * 点滅による不快なUXを防止する。
 *
 * @see https://medium.com/productboard-engineering/spinners-versus-skeletons
 * 「300msの閾値ルール」- それ以下のローディングは表示不要
 *
 * @example
 * ```tsx
 * const { data, isLoading } = api.users.list.useQuery()
 * const showLoading = useDelayedLoading(isLoading)
 *
 * if (showLoading) return <Skeleton />
 * return <UserList data={data} />
 * ```
 *
 * @param isLoading - 実際のローディング状態
 * @param delay - 表示を開始するまでの遅延時間（デフォルト: 300ms）
 * @returns 表示すべきかどうか
 */
export function useDelayedLoading(isLoading: boolean, delay = 300): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // 遅延後にローディング表示を開始
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      return () => clearTimeout(timer);
    }

    // ローディング終了時は即座に非表示
    setShowLoading(false);
    return undefined;
  }, [isLoading, delay]);

  return showLoading;
}

/**
 * 最小表示時間付き遅延ローディングフック
 *
 * 遅延表示に加え、一度表示されたら最小時間は表示を維持する。
 * 「チラつき」防止のための追加オプション。
 *
 * @example
 * ```tsx
 * const { data, isLoading } = api.users.list.useQuery()
 * const showLoading = useDelayedLoadingWithMinDuration(isLoading, {
 *   delay: 300,
 *   minDuration: 500
 * })
 * ```
 *
 * @param isLoading - 実際のローディング状態
 * @param options - 遅延時間と最小表示時間
 * @returns 表示すべきかどうか
 */
export function useDelayedLoadingWithMinDuration(
  isLoading: boolean,
  options: { delay?: number; minDuration?: number } = {},
): boolean {
  const { delay = 300, minDuration = 500 } = options;
  const [showLoading, setShowLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(true);
        setStartTime(Date.now());
      }, delay);

      return () => clearTimeout(timer);
    }

    // ローディング終了時、最小表示時間を確保
    if (startTime !== null) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
        setStartTime(null);
      }, remaining);

      return () => clearTimeout(timer);
    }

    setShowLoading(false);
    return undefined;
  }, [isLoading, delay, minDuration, startTime]);

  return showLoading;
}
