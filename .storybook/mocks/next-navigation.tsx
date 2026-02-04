/**
 * next/navigation のStorybook用モック
 * Storybook では Next.js の App Router フックが動作しないため代替
 */

// usePathname のモック - Storybook では pathname を args から受け取る想定
export function usePathname(): string {
  return '/ja/calendar';
}

// useRouter のモック
export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  };
}

// useSearchParams のモック
export function useSearchParams() {
  return new URLSearchParams();
}

// useParams のモック
export function useParams() {
  return {};
}

// redirect のモック
export function redirect(url: string): never {
  throw new Error(`Redirect to ${url}`);
}

// notFound のモック
export function notFound(): never {
  throw new Error('Not Found');
}
