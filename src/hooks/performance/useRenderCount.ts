/**
 * レンダリング回数追跡フック
 */

import { useEffect, useRef } from 'react';

/**
 * コンポーネントのレンダリング回数を追跡
 *
 * @param componentName - 追跡対象のコンポーネント名
 * @param enabled - 追跡を有効にするか
 * @returns 現在のレンダリング回数
 */
export function useRenderCount(componentName: string, enabled = false) {
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    if (enabled) {
      console.debug(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  return renderCount.current;
}
