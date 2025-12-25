'use client';

import { useEffect, useState } from 'react';

/**
 * prefers-reduced-motion メディアクエリを監視するフック
 *
 * ユーザーがアニメーションの減少を好む設定をしている場合にtrueを返す
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 * @see https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion()
 *
 * return (
 *   <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
 *     Content
 *   </div>
 * )
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // SSRセーフ: windowが存在しない場合は早期リターン
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 初期値を設定
    setPrefersReducedMotion(mediaQuery.matches);

    // 変更を監視
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
